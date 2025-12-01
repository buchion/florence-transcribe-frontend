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
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const export_service_1 = require("./export.service");
const export_dto_1 = require("./dto/export.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const audit_log_decorator_1 = require("../common/decorators/audit-log.decorator");
const audit_log_entity_1 = require("../audit/entities/audit-log.entity");
let ExportController = class ExportController {
    constructor(exportService) {
        this.exportService = exportService;
    }
    async export(dto) {
        return this.exportService.export(dto.soap_note_id, dto.ehr_provider, dto.patient_id, dto.practitioner_id, dto.client_id, dto.client_secret);
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, audit_log_decorator_1.AuditLog)({
        action: audit_log_entity_1.AuditAction.EXPORT,
        resourceType: audit_log_entity_1.AuditResourceType.SOAP_NOTE,
        resourceIdParam: 'soap_note_id',
        patientIdParam: 'patient_id',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [export_dto_1.ExportDto]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "export", null);
exports.ExportController = ExportController = __decorate([
    (0, common_1.Controller)('export'),
    __metadata("design:paramtypes", [export_service_1.ExportService])
], ExportController);
//# sourceMappingURL=export.controller.js.map