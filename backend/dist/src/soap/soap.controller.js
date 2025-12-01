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
exports.SoapController = void 0;
const common_1 = require("@nestjs/common");
const soap_service_1 = require("./soap.service");
const compose_dto_1 = require("./dto/compose.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const audit_log_decorator_1 = require("../common/decorators/audit-log.decorator");
const audit_log_entity_1 = require("../audit/entities/audit-log.entity");
let SoapController = class SoapController {
    constructor(soapService) {
        this.soapService = soapService;
    }
    async compose(dto, user) {
        return this.soapService.compose(dto.extraction_id, dto.clinical_extraction, dto.transcript_text, user.id);
    }
};
exports.SoapController = SoapController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, audit_log_decorator_1.AuditLog)({
        action: audit_log_entity_1.AuditAction.CREATE,
        resourceType: audit_log_entity_1.AuditResourceType.SOAP_NOTE,
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [compose_dto_1.ComposeDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], SoapController.prototype, "compose", null);
exports.SoapController = SoapController = __decorate([
    (0, common_1.Controller)('compose'),
    __metadata("design:paramtypes", [soap_service_1.SoapService])
], SoapController);
//# sourceMappingURL=soap.controller.js.map