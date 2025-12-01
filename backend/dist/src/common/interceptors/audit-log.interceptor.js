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
exports.AuditLogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const audit_service_1 = require("../../audit/audit.service");
const audit_log_decorator_1 = require("../decorators/audit-log.decorator");
let AuditLogInterceptor = class AuditLogInterceptor {
    constructor(reflector, auditService) {
        this.reflector = reflector;
        this.auditService = auditService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const metadata = this.reflector.get(audit_log_decorator_1.AUDIT_LOG_KEY, context.getHandler());
        if (!metadata) {
            return next.handle();
        }
        const user = request.user;
        const userId = user?.id || user?.userId;
        const userEmail = user?.email;
        const resourceId = metadata.resourceIdParam
            ? request.params[metadata.resourceIdParam] || request.body[metadata.resourceIdParam]
            : undefined;
        const patientId = metadata.patientIdParam
            ? request.params[metadata.patientIdParam] || request.body[metadata.patientIdParam]
            : undefined;
        const sessionId = metadata.sessionIdParam
            ? request.params[metadata.sessionIdParam] || request.body[metadata.sessionIdParam]
            : undefined;
        const ipAddress = request.ip ||
            request.headers['x-forwarded-for']?.toString().split(',')[0] ||
            request.socket.remoteAddress;
        const userAgent = request.headers['user-agent'];
        return next.handle().pipe((0, operators_1.tap)(() => {
            this.auditService
                .log({
                userId,
                userEmail,
                sessionId: sessionId ? Number(sessionId) : undefined,
                patientId: patientId ? Number(patientId) : undefined,
                action: metadata.action,
                resourceType: metadata.resourceType,
                resourceId: resourceId ? Number(resourceId) : undefined,
                ipAddress,
                userAgent,
                requestPath: request.path,
                requestMethod: request.method,
            })
                .catch((error) => {
                console.error('Failed to create audit log:', error);
            });
        }));
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        audit_service_1.AuditService])
], AuditLogInterceptor);
//# sourceMappingURL=audit-log.interceptor.js.map