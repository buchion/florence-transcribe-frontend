import { User } from '../../users/entities/user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
export declare enum SubscriptionStatus {
    ACTIVE = "ACTIVE",
    CANCELLED = "CANCELLED",
    PAST_DUE = "PAST_DUE",
    TRIALING = "TRIALING"
}
export declare class UserSubscription {
    id: number;
    userId: number;
    user: User;
    planId: number;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    stripeSubscriptionId: string | null;
    stripeCustomerId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
