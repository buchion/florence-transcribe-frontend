import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionsService } from '../subscriptions.service';
export declare const RequirePlan: (planType: string) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare class PlanGuard implements CanActivate {
    private reflector;
    private subscriptionsService;
    constructor(reflector: Reflector, subscriptionsService: SubscriptionsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
