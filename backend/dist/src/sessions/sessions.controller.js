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
exports.SessionsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const sessions_service_1 = require("./sessions.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SessionsController = class SessionsController {
    constructor(sessionsService) {
        this.sessionsService = sessionsService;
    }
    async handleAssemblyAIWebhook(payload, sessionIdParam) {
        return this.sessionsService.handleAssemblyAIWebhook(payload);
    }
    async uploadAudio(file, sessionId) {
        if (!file) {
            throw new common_1.BadRequestException('Audio file is required');
        }
        if (!sessionId) {
            throw new common_1.BadRequestException('Session ID is required');
        }
        const sessionIdNum = parseInt(sessionId, 10);
        if (isNaN(sessionIdNum)) {
            throw new common_1.BadRequestException('Invalid session ID');
        }
        this.sessionsService.processAudioWithSpeakerDiarization(sessionIdNum, file.buffer, file.mimetype).catch((error) => {
            console.error(`Error processing audio for session ${sessionIdNum}:`, error);
        });
        return {
            message: 'Audio uploaded successfully. Post-processing with speaker diarization started.',
            sessionId: sessionIdNum,
        };
    }
    async reprocessSpeakers(sessionId) {
        return this.sessionsService.reprocessSessionWithSpeakerDiarization(sessionId);
    }
};
exports.SessionsController = SessionsController;
__decorate([
    (0, common_1.Post)('webhook/assemblyai'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Body)('session_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "handleAssemblyAIWebhook", null);
__decorate([
    (0, common_1.Post)('upload-audio'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('session_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "uploadAudio", null);
__decorate([
    (0, common_1.Post)(':id/reprocess-speakers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "reprocessSpeakers", null);
exports.SessionsController = SessionsController = __decorate([
    (0, common_1.Controller)('sessions'),
    __metadata("design:paramtypes", [sessions_service_1.SessionsService])
], SessionsController);
//# sourceMappingURL=sessions.controller.js.map