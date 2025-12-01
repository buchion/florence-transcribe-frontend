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
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_plan_entity_1 = require("./entities/subscription-plan.entity");
const user_subscription_entity_1 = require("./entities/user-subscription.entity");
const usage_tracking_entity_1 = require("./entities/usage-tracking.entity");
const user_entity_1 = require("../users/entities/user.entity");
let SubscriptionsService = class SubscriptionsService {
    constructor(planRepository, subscriptionRepository, usageRepository, userRepository) {
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.usageRepository = usageRepository;
        this.userRepository = userRepository;
    }
    async onModuleInit() {
        await this.initializePlans();
    }
    async initializePlans() {
        const plans = [
            {
                planType: subscription_plan_entity_1.PlanType.LITE,
                name: 'Scribe Lite',
                price: 19.0,
                audioHoursLimit: 5,
                notesLimit: 5,
                features: { multiUser: false, ehrIntegration: false },
            },
            {
                planType: subscription_plan_entity_1.PlanType.PRO,
                name: 'Scribe Pro',
                price: 49.0,
                audioHoursLimit: 20,
                notesLimit: null,
                features: { multiUser: false, ehrIntegration: false },
            },
            {
                planType: subscription_plan_entity_1.PlanType.ENTERPRISE,
                name: 'Scribe Enterprise',
                price: 149.0,
                audioHoursLimit: null,
                notesLimit: null,
                features: { multiUser: true, ehrIntegration: true },
            },
        ];
        for (const planData of plans) {
            const existing = await this.planRepository.findOne({
                where: { planType: planData.planType },
            });
            if (!existing) {
                const plan = this.planRepository.create(planData);
                await this.planRepository.save(plan);
            }
        }
    }
    async getPlans() {
        return this.planRepository.find({ order: { price: 'ASC' } });
    }
    async getPlanByType(planType) {
        const plan = await this.planRepository.findOne({ where: { planType } });
        if (!plan) {
            await this.initializePlans();
            return this.planRepository.findOne({ where: { planType } });
        }
        return plan;
    }
    async getUserSubscription(userId) {
        return this.subscriptionRepository.findOne({
            where: { userId },
            relations: ['plan'],
        });
    }
    async createSubscription(userId, planId, stripeSubscriptionId, stripeCustomerId, currentPeriodStart, currentPeriodEnd) {
        const existing = await this.getUserSubscription(userId);
        if (existing) {
            existing.status = user_subscription_entity_1.SubscriptionStatus.CANCELLED;
            await this.subscriptionRepository.save(existing);
        }
        const subscription = this.subscriptionRepository.create({
            userId,
            planId,
            stripeSubscriptionId,
            stripeCustomerId,
            status: user_subscription_entity_1.SubscriptionStatus.ACTIVE,
            currentPeriodStart,
            currentPeriodEnd,
        });
        const saved = await this.subscriptionRepository.save(subscription);
        await this.userRepository.update(userId, {
            subscriptionId: saved.id,
            stripeCustomerId,
        });
        await this.getOrCreateUsageTracking(userId, currentPeriodStart, currentPeriodEnd);
        return saved;
    }
    async updateSubscriptionPeriod(subscriptionId, currentPeriodStart, currentPeriodEnd) {
        await this.subscriptionRepository.update(subscriptionId, {
            currentPeriodStart,
            currentPeriodEnd,
        });
        const subscription = await this.subscriptionRepository.findOne({
            where: { id: subscriptionId },
        });
        if (subscription) {
            await this.getOrCreateUsageTracking(subscription.userId, currentPeriodStart, currentPeriodEnd);
        }
    }
    async cancelSubscription(userId) {
        const subscription = await this.getUserSubscription(userId);
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        subscription.status = user_subscription_entity_1.SubscriptionStatus.CANCELLED;
        await this.subscriptionRepository.save(subscription);
    }
    async getOrCreateUsageTracking(userId, periodStart, periodEnd) {
        let usage = await this.usageRepository.findOne({
            where: {
                userId,
                periodStart,
                periodEnd,
            },
        });
        if (!usage) {
            usage = this.usageRepository.create({
                userId,
                periodStart,
                periodEnd,
                audioHoursUsed: 0,
                notesCreated: 0,
            });
            usage = await this.usageRepository.save(usage);
        }
        return usage;
    }
    async getCurrentUsage(userId) {
        const subscription = await this.getUserSubscription(userId);
        if (!subscription || subscription.status !== user_subscription_entity_1.SubscriptionStatus.ACTIVE) {
            return {
                subscription: null,
                usage: null,
                audioHoursUsed: 0,
                audioHoursLimit: null,
                notesCreated: 0,
                notesLimit: null,
            };
        }
        const usage = await this.getOrCreateUsageTracking(userId, subscription.currentPeriodStart, subscription.currentPeriodEnd);
        return {
            subscription,
            usage,
            audioHoursUsed: Number(usage.audioHoursUsed),
            audioHoursLimit: subscription.plan.audioHoursLimit,
            notesCreated: usage.notesCreated,
            notesLimit: subscription.plan.notesLimit,
        };
    }
    async checkAudioLimit(userId, additionalHours = 0) {
        const current = await this.getCurrentUsage(userId);
        if (!current.subscription) {
            throw new common_1.ForbiddenException('No active subscription');
        }
        const limit = current.audioHoursLimit;
        const currentUsage = current.audioHoursUsed + additionalHours;
        if (limit === null) {
            return {
                allowed: true,
                currentUsage,
                limit: null,
                remaining: null,
            };
        }
        return {
            allowed: currentUsage <= limit,
            currentUsage,
            limit,
            remaining: Math.max(0, limit - currentUsage),
        };
    }
    async checkNotesLimit(userId, additionalNotes = 0) {
        const current = await this.getCurrentUsage(userId);
        if (!current.subscription) {
            throw new common_1.ForbiddenException('No active subscription');
        }
        const limit = current.notesLimit;
        const currentUsage = current.notesCreated + additionalNotes;
        if (limit === null) {
            return {
                allowed: true,
                currentUsage,
                limit: null,
                remaining: null,
            };
        }
        return {
            allowed: currentUsage <= limit,
            currentUsage,
            limit,
            remaining: Math.max(0, limit - currentUsage),
        };
    }
    async incrementAudioUsage(userId, hours) {
        const subscription = await this.getUserSubscription(userId);
        if (!subscription || subscription.status !== user_subscription_entity_1.SubscriptionStatus.ACTIVE) {
            return;
        }
        const usage = await this.getOrCreateUsageTracking(userId, subscription.currentPeriodStart, subscription.currentPeriodEnd);
        usage.audioHoursUsed = Number(usage.audioHoursUsed) + hours;
        await this.usageRepository.save(usage);
    }
    async incrementNotesUsage(userId, count = 1) {
        const subscription = await this.getUserSubscription(userId);
        if (!subscription || subscription.status !== user_subscription_entity_1.SubscriptionStatus.ACTIVE) {
            return;
        }
        const usage = await this.getOrCreateUsageTracking(userId, subscription.currentPeriodStart, subscription.currentPeriodEnd);
        usage.notesCreated += count;
        await this.usageRepository.save(usage);
    }
    async calculateAudioDurationFromBuffer(audioBuffer, mimeType) {
        const fileSizeBytes = audioBuffer.length;
        const estimatedBitrate = 64000;
        const durationSeconds = (fileSizeBytes * 8) / estimatedBitrate;
        return Math.min(durationSeconds / 3600, 2);
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(user_subscription_entity_1.UserSubscription)),
    __param(2, (0, typeorm_1.InjectRepository)(usage_tracking_entity_1.UsageTracking)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map