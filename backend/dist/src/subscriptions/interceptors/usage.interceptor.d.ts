import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SubscriptionsService } from '../subscriptions.service';
export declare class UsageInterceptor implements NestInterceptor {
    private subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
