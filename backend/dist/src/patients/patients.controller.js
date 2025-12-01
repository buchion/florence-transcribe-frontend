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
exports.PatientsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const patients_service_1 = require("./patients.service");
const create_patient_dto_1 = require("./dto/create-patient.dto");
const update_patient_dto_1 = require("./dto/update-patient.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const audit_log_decorator_1 = require("../common/decorators/audit-log.decorator");
const audit_log_entity_1 = require("../audit/entities/audit-log.entity");
let PatientsController = class PatientsController {
    constructor(patientsService) {
        this.patientsService = patientsService;
    }
    async create(createPatientDto, user) {
        return this.patientsService.create(createPatientDto, user.id);
    }
    async findAll(skip, limit, user, search) {
        const [patients, total] = await this.patientsService.findAll(skip, limit, search, user.id);
        return {
            patients,
            total,
            skip,
            limit,
        };
    }
    async search(query, user) {
        if (!query) {
            throw new common_1.BadRequestException('Search query is required');
        }
        return this.patientsService.search(query, user.id);
    }
    async findOne(id, user) {
        return this.patientsService.findOne(id, user.id);
    }
    async getPatientSessions(id, user) {
        const patient = await this.patientsService.getPatientSessions(id, user.id);
        return {
            patient,
            sessions: patient.sessions || [],
        };
    }
    async update(id, updatePatientDto, user) {
        return this.patientsService.update(id, updatePatientDto, user.id);
    }
    async import(file) {
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
        if (fileExtension === 'csv') {
            return this.patientsService.importFromCSV(file);
        }
        else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            return this.patientsService.importFromExcel(file);
        }
        else {
            throw new common_1.BadRequestException('Unsupported file type. Please upload CSV or Excel file.');
        }
    }
};
exports.PatientsController = PatientsController;
__decorate([
    (0, common_1.Post)(),
    (0, audit_log_decorator_1.AuditLog)({
        action: audit_log_entity_1.AuditAction.CREATE,
        resourceType: audit_log_entity_1.AuditResourceType.PATIENT,
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_patient_dto_1.CreatePatientDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, audit_log_decorator_1.AuditLog)({
        action: audit_log_entity_1.AuditAction.VIEW,
        resourceType: audit_log_entity_1.AuditResourceType.PATIENT,
    }),
    __param(0, (0, common_1.Query)('skip', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(100), common_1.ParseIntPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, audit_log_decorator_1.AuditLog)({
        action: audit_log_entity_1.AuditAction.VIEW,
        resourceType: audit_log_entity_1.AuditResourceType.PATIENT,
        resourceIdParam: 'id',
        patientIdParam: 'id',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/sessions'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "getPatientSessions", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, audit_log_decorator_1.AuditLog)({
        action: audit_log_entity_1.AuditAction.UPDATE,
        resourceType: audit_log_entity_1.AuditResourceType.PATIENT,
        resourceIdParam: 'id',
        patientIdParam: 'id',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_patient_dto_1.UpdatePatientDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "import", null);
exports.PatientsController = PatientsController = __decorate([
    (0, common_1.Controller)('patients'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [patients_service_1.PatientsService])
], PatientsController);
//# sourceMappingURL=patients.controller.js.map