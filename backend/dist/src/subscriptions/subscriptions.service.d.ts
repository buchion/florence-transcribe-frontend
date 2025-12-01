import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SubscriptionPlan, PlanType } from './entities/subscription-plan.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { UsageTracking } from './entities/usage-tracking.entity';
import { User } from '../users/entities/user.entity';
export declare class SubscriptionsService implements OnModuleInit {
    private planRepository;
    private subscriptionRepository;
    private usageRepository;
    private userRepository;
    constructor(planRepository: Repository<SubscriptionPlan>, subscriptionRepository: Repository<UserSubscription>, usageRepository: Repository<UsageTracking>, userRepository: Repository<User>);
    onModuleInit(): Promise<void>;
    initializePlans(): Promise<void>;
    getPlans(): Promise<SubscriptionPlan[]>;
    getPlanByType(planType: PlanType): Promise<SubscriptionPlan | null>;
    getUserSubscription(userId: number): Promise<UserSubscription | null>;
    createSubscription(userId: number, planId: number, stripeSubscriptionId: string, stripeCustomerId: string, currentPeriodStart: Date, currentPeriodEnd: Date): Promise<UserSubscription>;
    updateSubscriptionPeriod(subscriptionId: number, currentPeriodStart: Date, currentPeriodEnd: Date): Promise<void>;
    cancelSubscription(userId: number): Promise<void>;
    getOrCreateUsageTracking(userId: number, periodStart: Date, periodEnd: Date): Promise<UsageTracking>;
    getCurrentUsage(userId: number): Promise<{
        subscription: UserSubscription | null;
        usage: UsageTracking | null;
        audioHoursUsed: number;
        audioHoursLimit: number | null;
        notesCreated: number;
        notesLimit: number | null;
    }>;
    checkAudioLimit(userId: number, additionalHours?: number): Promise<{
        allowed: boolean;
        currentUsage: number;
        limit: number | null;
        remaining: number | null;
    }>;
    checkNotesLimit(userId: number, additionalNotes?: number): Promise<{
        allowed: boolean;
        currentUsage: number;
        limit: number | null;
        remaining: number | null;
    }>;
    incrementAudioUsage(userId: number, hours: number): Promise<void>;
    incrementNotesUsage(userId: number, count?: number): Promise<void>;
    calculateAudioDurationFromBuffer(audioBuffer: Buffer, mimeType: string): Promise<number>;
}
