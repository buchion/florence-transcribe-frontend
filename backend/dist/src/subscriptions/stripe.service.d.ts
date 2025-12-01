import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { SubscriptionsService } from './subscriptions.service';
import { PlanType } from './entities/subscription-plan.entity';
import { User } from '../users/entities/user.entity';
export declare class StripeService {
    private configService;
    private subscriptionsService;
    private userRepository;
    private readonly logger;
    private stripe;
    constructor(configService: ConfigService, subscriptionsService: SubscriptionsService, userRepository: Repository<User>);
    createCustomer(email: string, name?: string): Promise<Stripe.Customer>;
    createCheckoutSession(customerId: string, planType: PlanType, successUrl: string, cancelUrl: string): Promise<Stripe.Checkout.Session>;
    private getOrCreatePriceId;
    handleWebhook(payload: Buffer, signature: string): Promise<{
        processed: boolean;
        eventType: string;
    }>;
    private handleCheckoutCompleted;
    private handleSubscriptionUpdated;
    private handleSubscriptionDeleted;
    private handlePaymentSucceeded;
    private handlePaymentFailed;
    cancelSubscription(stripeSubscriptionId: string): Promise<void>;
    private findUserByStripeCustomerId;
}
