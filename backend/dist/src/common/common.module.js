"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const encryption_service_1 = require("./encryption.service");
const redaction_service_1 = require("./redaction.service");
const audit_log_interceptor_1 = require("./interceptors/audit-log.interceptor");
const audit_module_1 = require("../audit/audit.module");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Module)({
        imports: [audit_module_1.AuditModule],
        providers: [
            encryption_service_1.EncryptionService,
            redaction_service_1.RedactionService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_log_interceptor_1.AuditLogInterceptor,
            },
        ],
        exports: [encryption_service_1.EncryptionService, redaction_service_1.RedactionService],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map