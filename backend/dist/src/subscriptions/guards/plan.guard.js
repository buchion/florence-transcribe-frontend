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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanGuard = exports.RequirePlan = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const subscriptions_service_1 = require("../subscriptions.service");
const RequirePlan = (planType) => {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata('requiredPlan', planType, descriptor.value);
    };
};
exports.RequirePlan = RequirePlan;
let PlanGuard = class PlanGuard {
    constructor(reflector, subscriptionsService) {
        this.reflector = reflector;
        this.subscriptionsService = subscriptionsService;
    }
    async canActivate(context) {
        const requiredPlan = this.reflector.get('requiredPlan', context.getHandler());
        if (!requiredPlan) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('Authentication required');
        }
        const subscription = await this.subscriptionsService.getUserSubscription(user.id);
        if (!subscription || subscription.status !== 'ACTIVE') {
            throw new common_1.ForbiddenException('Active subscription required');
        }
        const planHierarchy = { LITE: 1, PRO: 2, ENTERPRISE: 3 };
        const userPlanLevel = planHierarchy[subscription.plan.planType] || 0;
        const requiredPlanLevel = planHierarchy[requiredPlan] || 0;
        if (userPlanLevel < requiredPlanLevel) {
            throw new common_1.ForbiddenException(`Plan upgrade required: ${requiredPlan} plan needed`);
        }
        return true;
    }
};
exports.PlanGuard = PlanGuard;
exports.PlanGuard = PlanGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        subscriptions_service_1.SubscriptionsService])
], PlanGuard);
//# sourceMappingURL=plan.guard.js.map