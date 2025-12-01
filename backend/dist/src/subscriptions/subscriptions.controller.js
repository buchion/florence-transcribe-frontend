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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const subscriptions_service_1 = require("./subscriptions.service");
const stripe_service_1 = require("./stripe.service");
const subscription_plan_entity_1 = require("./entities/subscription-plan.entity");
let SubscriptionsController = class SubscriptionsController {
    constructor(subscriptionsService, stripeService, userRepository) {
        this.subscriptionsService = subscriptionsService;
        this.stripeService = stripeService;
        this.userRepository = userRepository;
    }
    async getPlans() {
        return this.subscriptionsService.getPlans();
    }
    async getCurrentSubscription(user) {
        const subscription = await this.subscriptionsService.getUserSubscription(user.id);
        return subscription;
    }
    async getUsage(user) {
        return this.subscriptionsService.getCurrentUsage(user.id);
    }
    async createCheckoutSession(user, planType) {
        try {
            if (!planType || !Object.values(subscription_plan_entity_1.PlanType).includes(planType)) {
                throw new common_1.BadRequestException('Invalid plan type');
            }
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const successUrl = `${frontendUrl}/pricing?success=true`;
            const cancelUrl = `${frontendUrl}/pricing?canceled=true`;
            let customerId = user.stripeCustomerId;
            if (!customerId) {
                const customer = await this.stripeService.createCustomer(user.email, user.name || undefined);
                customerId = customer.id;
                await this.userRepository.update(user.id, { stripeCustomerId: customerId });
            }
            const session = await this.stripeService.createCheckoutSession(customerId, planType, successUrl, cancelUrl);
            return {
                sessionId: session.id,
                url: session.url,
            };
        }
        catch (error) {
            console.error('Error creating checkout session:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            const errorMessage = error?.message || error?.toString() || 'Failed to create checkout session';
            throw new common_1.BadRequestException(errorMessage);
        }
    }
    async handleWebhook(req) {
        const signature = req.headers['stripe-signature'];
        if (!signature) {
            throw new Error('Missing stripe-signature header');
        }
        const payload = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
        return this.stripeService.handleWebhook(payload, signature);
    }
    async cancelSubscription(user) {
        const subscription = await this.subscriptionsService.getUserSubscription(user.id);
        if (!subscription || !subscription.stripeSubscriptionId) {
            throw new Error('No active subscription found');
        }
        await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);
        await this.subscriptionsService.cancelSubscription(user.id);
        return { message: 'Subscription cancelled successfully' };
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Get)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getCurrentSubscription", null);
__decorate([
    (0, common_1.Get)('usage'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getUsage", null);
__decorate([
    (0, common_1.Post)('create-checkout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('planType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "createCheckoutSession", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Post)('cancel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "cancelSubscription", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, common_1.Controller)('subscriptions'),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService,
        stripe_service_1.StripeService,
        typeorm_2.Repository])
], SubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map