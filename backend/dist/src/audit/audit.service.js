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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("./entities/audit-log.entity");
let AuditService = class AuditService {
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    async log(data) {
        const auditLog = this.auditLogRepository.create(data);
        return this.auditLogRepository.save(auditLog);
    }
    async findByUserId(userId, limit = 100) {
        return this.auditLogRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async findByPatientId(patientId, limit = 100) {
        return this.auditLogRepository.find({
            where: { patientId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async findBySessionId(sessionId, limit = 100) {
        return this.auditLogRepository.find({
            where: { sessionId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async findByResource(resourceType, resourceId, limit = 100) {
        return this.auditLogRepository.find({
            where: { resourceType, resourceId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async findRecent(limit = 100) {
        return this.auditLogRepository.find({
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async findAccessToPHI(startDate, endDate, limit = 1000) {
        const query = this.auditLogRepository
            .createQueryBuilder('audit')
            .where('audit.resourceType IN (:...phiTypes)', {
            phiTypes: [
                audit_log_entity_1.AuditResourceType.PATIENT,
                audit_log_entity_1.AuditResourceType.TRANSCRIPT,
                audit_log_entity_1.AuditResourceType.SOAP_NOTE,
                audit_log_entity_1.AuditResourceType.CLINICAL_EXTRACTION,
            ],
        })
            .orderBy('audit.createdAt', 'DESC')
            .take(limit);
        if (startDate) {
            query.andWhere('audit.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            query.andWhere('audit.createdAt <= :endDate', { endDate });
        }
        return query.getMany();
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditService);
//# sourceMappingURL=audit.service.js.map