"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stripe_1 = __importDefault(require("stripe"));
const subscriptions_service_1 = require("./subscriptions.service");
const user_entity_1 = require("../users/entities/user.entity");
let StripeService = StripeService_1 = class StripeService {
    constructor(configService, subscriptionsService, userRepository) {
        this.configService = configService;
        this.subscriptionsService = subscriptionsService;
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(StripeService_1.name);
        const secretKey = this.configService.get('STRIPE_SECRET_KEY');
        if (!secretKey) {
            this.logger.warn('STRIPE_SECRET_KEY not configured. Stripe functionality will be disabled.');
            return;
        }
        this.stripe = new stripe_1.default(secretKey, {
            apiVersion: '2025-11-17.clover',
        });
    }
    async createCustomer(email, name) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe is not configured');
        }
        return this.stripe.customers.create({
            email,
            name,
        });
    }
    async createCheckoutSession(customerId, planType, successUrl, cancelUrl) {
        if (!this.stripe) {
            this.logger.error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
            throw new common_1.BadRequestException('Stripe is not configured. Please contact support.');
        }
        this.logger.log(`Creating checkout session for plan: ${planType}, customer: ${customerId}`);
        const plan = await this.subscriptionsService.getPlanByType(planType);
        if (!plan) {
            this.logger.error(`Plan ${planType} not found in database. Plans may not be initialized.`);
            throw new common_1.BadRequestException(`Plan ${planType} not found. Please ensure plans are initialized.`);
        }
        this.logger.log(`Found plan: ${plan.name}, price: $${plan.price}`);
        const priceId = await this.getOrCreatePriceId(plan);
        this.logger.log(`Using Stripe price ID: ${priceId}`);
        try {
            const session = await this.stripe.checkout.sessions.create({
                customer: customerId,
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    planType,
                    planId: plan.id.toString(),
                },
            });
            this.logger.log(`Checkout session created: ${session.id}`);
            return session;
        }
        catch (error) {
            this.logger.error(`Stripe API error creating checkout session: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to create checkout session: ${error.message}`);
        }
    }
    async getOrCreatePriceId(plan) {
        try {
            const productName = `Scribe ${plan.planType}`;
            const products = await this.stripe.products.list({
                limit: 100,
            });
            let product = products.data.find((p) => p.name === productName);
            if (!product) {
                product = await this.stripe.products.create({
                    name: productName,
                    description: plan.name,
                });
                this.logger.log(`Created Stripe product: ${productName} (${product.id})`);
            }
            const prices = await this.stripe.prices.list({
                product: product.id,
                limit: 1,
            });
            if (prices.data.length > 0) {
                return prices.data[0].id;
            }
            const price = await this.stripe.prices.create({
                product: product.id,
                unit_amount: Math.round(Number(plan.price) * 100),
                currency: 'usd',
                recurring: {
                    interval: 'month',
                },
            });
            this.logger.log(`Created Stripe price: ${price.id} for product ${productName}`);
            return price.id;
        }
        catch (error) {
            this.logger.error(`Error creating/getting Stripe price: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to create Stripe price: ${error.message}`);
        }
    }
    async handleWebhook(payload, signature) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe is not configured');
        }
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            this.logger.warn('STRIPE_WEBHOOK_SECRET not configured. Webhook verification skipped.');
        }
        let event;
        try {
            if (webhookSecret) {
                event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
            }
            else {
                event = JSON.parse(payload.toString());
                this.logger.warn('Webhook verification skipped (development mode)');
            }
        }
        catch (err) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new common_1.BadRequestException(`Webhook signature verification failed: ${err.message}`);
        }
        this.logger.log(`Processing Stripe webhook: ${event.type}`);
        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object;
                    await this.handleCheckoutCompleted(session);
                    break;
                }
                case 'customer.subscription.created':
                case 'customer.subscription.updated': {
                    const subscription = event.data.object;
                    await this.handleSubscriptionUpdated(subscription);
                    break;
                }
                case 'customer.subscription.deleted': {
                    const subscription = event.data.object;
                    await this.handleSubscriptionDeleted(subscription);
                    break;
                }
                case 'invoice.payment_succeeded': {
                    const invoice = event.data.object;
                    await this.handlePaymentSucceeded(invoice);
                    break;
                }
                case 'invoice.payment_failed': {
                    const invoice = event.data.object;
                    await this.handlePaymentFailed(invoice);
                    break;
                }
                default:
                    this.logger.log(`Unhandled event type: ${event.type}`);
            }
            return { processed: true, eventType: event.type };
        }
        catch (error) {
            this.logger.error(`Error processing webhook ${event.type}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleCheckoutCompleted(session) {
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const planType = session.metadata?.planType;
        if (!customerId || !subscriptionId || !planType) {
            this.logger.error('Missing required data in checkout session', {
                customerId,
                subscriptionId,
                planType,
            });
            return;
        }
        const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
        const plan = await this.subscriptionsService.getPlanByType(planType);
        if (!plan) {
            this.logger.error(`Plan ${planType} not found`);
            return;
        }
        const user = await this.findUserByStripeCustomerId(customerId);
        if (!user) {
            this.logger.error(`User not found for Stripe customer ${customerId}`);
            return;
        }
        await this.subscriptionsService.createSubscription(user.id, plan.id, subscriptionId, customerId, new Date(subscription.current_period_start * 1000), new Date(subscription.current_period_end * 1000));
        this.logger.log(`Subscription created for user ${user.id}, plan ${planType}`);
    }
    async handleSubscriptionUpdated(subscription) {
        const subscriptionId = subscription.id;
        const customerId = subscription.customer;
        const user = await this.findUserByStripeCustomerId(customerId);
        if (!user) {
            this.logger.error(`User not found for Stripe customer ${customerId}`);
            return;
        }
        const userSubscription = await this.subscriptionsService.getUserSubscription(user.id);
        if (!userSubscription || userSubscription.stripeSubscriptionId !== subscriptionId) {
            return;
        }
        await this.subscriptionsService.updateSubscriptionPeriod(userSubscription.id, new Date(subscription.current_period_start * 1000), new Date(subscription.current_period_end * 1000));
        this.logger.log(`Subscription period updated for user ${user.id}`);
    }
    async handleSubscriptionDeleted(subscription) {
        const customerId = subscription.customer;
        const user = await this.findUserByStripeCustomerId(customerId);
        if (!user) {
            this.logger.error(`User not found for Stripe customer ${customerId}`);
            return;
        }
        await this.subscriptionsService.cancelSubscription(user.id);
        this.logger.log(`Subscription cancelled for user ${user.id}`);
    }
    async handlePaymentSucceeded(invoice) {
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription
            ? (typeof invoice.subscription === 'string'
                ? invoice.subscription
                : invoice.subscription?.id)
            : null;
        if (!subscriptionId) {
            return;
        }
        const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
        const user = await this.findUserByStripeCustomerId(customerId);
        if (!user) {
            this.logger.error(`User not found for Stripe customer ${customerId}`);
            return;
        }
        const userSubscription = await this.subscriptionsService.getUserSubscription(user.id);
        if (userSubscription && userSubscription.stripeSubscriptionId === subscriptionId) {
            await this.subscriptionsService.updateSubscriptionPeriod(userSubscription.id, new Date(subscription.current_period_start * 1000), new Date(subscription.current_period_end * 1000));
        }
        this.logger.log(`Payment succeeded for user ${user.id}`);
    }
    async handlePaymentFailed(invoice) {
        const customerId = invoice.customer;
        const user = await this.findUserByStripeCustomerId(customerId);
        if (!user) {
            this.logger.error(`User not found for Stripe customer ${customerId}`);
            return;
        }
        this.logger.warn(`Payment failed for user ${user.id}`);
    }
    async cancelSubscription(stripeSubscriptionId) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe is not configured');
        }
        await this.stripe.subscriptions.cancel(stripeSubscriptionId);
    }
    async findUserByStripeCustomerId(customerId) {
        return this.userRepository.findOne({
            where: { stripeCustomerId: customerId },
        });
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => subscriptions_service_1.SubscriptionsService))),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        subscriptions_service_1.SubscriptionsService,
        typeorm_2.Repository])
], StripeService);
//# sourceMappingURL=stripe.service.js.map