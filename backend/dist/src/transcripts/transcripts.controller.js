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
exports.TranscriptsController = void 0;
const common_1 = require("@nestjs/common");
const transcripts_service_1 = require("./transcripts.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const audit_log_entity_1 = require("../audit/entities/audit-log.entity");
const audit_service_1 = require("../audit/audit.service");
const audit_log_decorator_1 = require("../common/decorators/audit-log.decorator");
const redaction_service_1 = require("../common/redaction.service");
const sessions_service_1 = require("../sessions/sessions.service");
const patients_service_1 = require("../patients/patients.service");
let TranscriptsController = class TranscriptsController {
    constructor(transcriptsService, auditService, redactionService, sessionsService, patientsService) {
        this.transcriptsService = transcriptsService;
        this.auditService = auditService;
        this.redactionService = redactionService;
        this.sessionsService = sessionsService;
        this.patientsService = patientsService;
    }
    async getBySessionId(sessionId) {
        const transcripts = await this.transcriptsService.findBySessionId(sessionId);
        return { transcripts };
    }
    async getById(id) {
        const transcript = await this.transcriptsService.findById(id);
        if (!transcript) {
            throw new Error('Transcript not found');
        }
        return { transcript };
    }
    async getRedactedTranscript(id, redactNames, redactPhone, redactEmail, redactSSN, request) {
        const transcript = await this.transcriptsService.findById(id);
        if (!transcript) {
            throw new Error('Transcript not found');
        }
        const session = await this.sessionsService.findById(transcript.sessionId);
        const user = request?.user;
        const patient = session?.patientEntityId
            ? await this.patientsService.findOne(session.patientEntityId, user?.id || user?.userId)
            : null;
        const redactionOptions = {
            redactNames: redactNames !== 'false',
            redactPhone: redactPhone !== 'false',
            redactEmail: redactEmail !== 'false',
            redactSSN: redactSSN !== 'false',
            redactDates: false,
        };
        let redactedText = transcript.text;
        let redactedItems = [];
        if (patient && redactionOptions.redactNames) {
            const nameResult = this.redactionService.redactPatientNames(redactedText, patient);
            redactedText = nameResult.redactedText;
            redactedItems = [...nameResult.redactedItems];
        }
        const patternResult = this.redactionService.redactText(redactedText, redactionOptions);
        redactedText = patternResult.redactedText;
        redactedItems = [...redactedItems, ...patternResult.redactedItems];
        await this.auditService.log({
            userId: user?.id || user?.userId,
            userEmail: user?.email,
            sessionId: session?.id,
            patientId: patient?.id,
            action: audit_log_entity_1.AuditAction.REDACT,
            resourceType: audit_log_entity_1.AuditResourceType.TRANSCRIPT,
            resourceId: transcript.id,
            metadata: {
                redactedItems: redactedItems.map((item) => ({
                    type: item.type,
                })),
                redactionOptions,
            },
            ipAddress: request?.ip ||
                request?.headers['x-forwarded-for']?.toString().split(',')[0] ||
                request?.socket.remoteAddress,
            userAgent: request?.headers['user-agent'],
            requestPath: request?.path,
            requestMethod: request?.method,
        });
        return {
            redactedText,
            redactedItemsCount: redactedItems.length,
            originalLength: transcript.text.length,
            redactedLength: redactedText.length,
        };
    }
};
exports.TranscriptsController = TranscriptsController;
__decorate([
    (0, common_1.Get)('session/:sessionId'),
    (0, audit_log_decorator_1.AuditLog)({
        action: audit_log_entity_1.AuditAction.VIEW,
        resourceType: audit_log_entity_1.AuditResourceType.TRANSCRIPT,
        sessionIdParam: 'sessionId',
    }),
    __param(0, (0, common_1.Param)('sessionId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TranscriptsController.prototype, "getBySessionId", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, audit_log_decorator_1.AuditLog)({
        action: audit_log_entity_1.AuditAction.VIEW,
        resourceType: audit_log_entity_1.AuditResourceType.TRANSCRIPT,
        resourceIdParam: 'id',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TranscriptsController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)(':id/redacted'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('redactNames')),
    __param(2, (0, common_1.Query)('redactPhone')),
    __param(3, (0, common_1.Query)('redactEmail')),
    __param(4, (0, common_1.Query)('redactSSN')),
    __param(5, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TranscriptsController.prototype, "getRedactedTranscript", null);
exports.TranscriptsController = TranscriptsController = __decorate([
    (0, common_1.Controller)('transcripts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [transcripts_service_1.TranscriptsService,
        audit_service_1.AuditService,
        redaction_service_1.RedactionService,
        sessions_service_1.SessionsService,
        patients_service_1.PatientsService])
], TranscriptsController);
//# sourceMappingURL=transcripts.controller.js.map