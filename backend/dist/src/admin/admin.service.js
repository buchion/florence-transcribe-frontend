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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const session_entity_1 = require("../sessions/entities/session.entity");
const soap_note_entity_1 = require("../soap/entities/soap-note.entity");
const export_log_entity_1 = require("../export/entities/export-log.entity");
let AdminService = class AdminService {
    constructor(sessionsRepository, soapNotesRepository, exportLogsRepository) {
        this.sessionsRepository = sessionsRepository;
        this.soapNotesRepository = soapNotesRepository;
        this.exportLogsRepository = exportLogsRepository;
    }
    async getSessions(skip = 0, limit = 100, userId) {
        const where = {};
        if (userId) {
            where.userId = userId;
        }
        const [sessions, total] = await this.sessionsRepository.findAndCount({
            where,
            relations: ['user'],
            skip,
            take: Math.min(limit, 1000),
            order: { createdAt: 'DESC' },
        });
        return {
            sessions: sessions.map((session) => ({
                id: session.id,
                user_id: session.userId,
                user_email: session.user?.email,
                patient_id: session.patientId,
                patient_name: session.patientName,
                patient_entity_id: session.patientEntityId || null,
                status: session.status,
                started_at: session.startedAt?.toISOString(),
                ended_at: session.endedAt?.toISOString() || null,
                created_at: session.createdAt.toISOString(),
            })),
            total,
        };
    }
    async getNotes(skip = 0, limit = 100) {
        const [notes, total] = await this.soapNotesRepository.findAndCount({
            relations: ['extraction'],
            skip,
            take: Math.min(limit, 1000),
            order: { createdAt: 'DESC' },
        });
        return {
            notes: notes.map((note) => ({
                id: note.id,
                extraction_id: note.extractionId,
                created_at: note.createdAt.toISOString(),
            })),
            total,
        };
    }
    async getExportLogs(skip = 0, limit = 100, status) {
        const where = {};
        if (status) {
            where.status = status;
        }
        const [logs, total] = await this.exportLogsRepository.findAndCount({
            where,
            relations: ['soapNote'],
            skip,
            take: Math.min(limit, 1000),
            order: { createdAt: 'DESC' },
        });
        return {
            logs: logs.map((log) => ({
                id: log.id,
                soap_note_id: log.soapNoteId,
                ehr_provider: log.ehrProvider,
                status: log.status,
                error_message: log.errorMessage,
                created_at: log.createdAt.toISOString(),
                updated_at: log.updatedAt?.toISOString() || null,
            })),
            total,
        };
    }
    async getStats() {
        const [, totalSessions] = await this.sessionsRepository.findAndCount();
        const [, totalNotes] = await this.soapNotesRepository.findAndCount();
        const [, totalExports] = await this.exportLogsRepository.findAndCount();
        const [, successfulExports] = await this.exportLogsRepository.findAndCount({
            where: { status: export_log_entity_1.ExportStatus.SUCCESS },
        });
        const exportSuccessRate = totalExports > 0 ? (successfulExports / totalExports) * 100 : 0;
        return {
            total_sessions: totalSessions,
            total_notes: totalNotes,
            total_exports: totalExports,
            successful_exports: successfulExports,
            export_success_rate: parseFloat(exportSuccessRate.toFixed(2)),
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __param(1, (0, typeorm_1.InjectRepository)(soap_note_entity_1.SOAPNote)),
    __param(2, (0, typeorm_1.InjectRepository)(export_log_entity_1.ExportLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map