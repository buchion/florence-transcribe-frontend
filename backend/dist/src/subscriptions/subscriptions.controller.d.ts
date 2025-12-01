import { RawBodyRequest } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from './stripe.service';
import { PlanType } from './entities/subscription-plan.entity';
export declare class SubscriptionsController {
    private subscriptionsService;
    private stripeService;
    private userRepository;
    constructor(subscriptionsService: SubscriptionsService, stripeService: StripeService, userRepository: Repository<User>);
    getPlans(): Promise<import("./entities/subscription-plan.entity").SubscriptionPlan[]>;
    getCurrentSubscription(user: User): Promise<import("./entities/user-subscription.entity").UserSubscription>;
    getUsage(user: User): Promise<{
        subscription: import("./entities/user-subscription.entity").UserSubscription | null;
        usage: import("./entities/usage-tracking.entity").UsageTracking | null;
        audioHoursUsed: number;
        audioHoursLimit: number | null;
        notesCreated: number;
        notesLimit: number | null;
    }>;
    createCheckoutSession(user: User, planType: PlanType): Promise<{
        sessionId: string;
        url: string;
    }>;
    handleWebhook(req: RawBodyRequest<Request & {
        rawBody?: Buffer;
    }>): Promise<{
        processed: boolean;
        eventType: string;
    }>;
    cancelSubscription(user: User): Promise<{
        message: string;
    }>;
}
