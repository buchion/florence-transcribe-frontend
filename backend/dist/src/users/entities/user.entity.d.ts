import { UserSubscription } from '../../subscriptions/entities/user-subscription.entity';
export declare class User {
    id: number;
    email: string;
    name: string;
    hashedPassword: string;
    isActive: boolean;
    isVerified: boolean;
    stripeCustomerId: string | null;
    subscriptionId: number | null;
    subscription: UserSubscription | null;
    createdAt: Date;
    updatedAt: Date;
}
