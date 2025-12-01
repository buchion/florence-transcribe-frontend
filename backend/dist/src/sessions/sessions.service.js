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
var SessionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const assemblyai_1 = require("assemblyai");
const session_entity_1 = require("./entities/session.entity");
const patients_service_1 = require("../patients/patients.service");
const transcripts_service_1 = require("../transcripts/transcripts.service");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
let SessionsService = SessionsService_1 = class SessionsService {
    constructor(sessionsRepository, patientsService, transcriptsService, configService, subscriptionsService) {
        this.sessionsRepository = sessionsRepository;
        this.patientsService = patientsService;
        this.transcriptsService = transcriptsService;
        this.configService = configService;
        this.subscriptionsService = subscriptionsService;
        this.logger = new common_1.Logger(SessionsService_1.name);
    }
    async create(sessionData) {
        const session = this.sessionsRepository.create(sessionData);
        if (sessionData.patientEntityId && sessionData.userId) {
            try {
                await this.patientsService.findOne(sessionData.patientEntityId, sessionData.userId);
            }
            catch (error) {
                throw new Error(`Patient with ID ${sessionData.patientEntityId} not found or does not belong to user`);
            }
        }
        return this.sessionsRepository.save(session);
    }
    async findById(id) {
        return this.sessionsRepository.findOne({
            where: { id },
            relations: ['user', 'patient'],
        });
    }
    async findByUserId(userId, skip = 0, limit = 100) {
        return this.sessionsRepository.findAndCount({
            where: { userId },
            relations: ['user', 'patient'],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
    }
    async findAll(skip = 0, limit = 100, userId) {
        const where = userId ? { userId } : {};
        return this.sessionsRepository.findAndCount({
            where,
            relations: ['user', 'patient'],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
    }
    async updateStatus(id, status, endedAt) {
        await this.sessionsRepository.update(id, { status, endedAt });
        const session = await this.findById(id);
        return session;
    }
    async processAudioWithSpeakerDiarization(sessionId, audioBuffer, mimeType) {
        this.logger.log(`Starting speaker diarization processing for session ${sessionId}`);
        const apiKey = this.configService.get('ASSEMBLYAI_API_KEY');
        if (!apiKey) {
            this.logger.error('AssemblyAI API key not configured');
            throw new Error('AssemblyAI API key not configured');
        }
        const session = await this.findById(sessionId);
        if (!session) {
            this.logger.error(`Session ${sessionId} not found`);
            throw new Error(`Session ${sessionId} not found`);
        }
        try {
            const assemblyaiClient = new assemblyai_1.AssemblyAI({ apiKey });
            const baseUrl = this.configService.get('WEBHOOK_BASE_URL') ||
                this.configService.get('BACKEND_URL') ||
                'http://localhost:8000';
            const webhookUrl = `${baseUrl}/api/sessions/webhook/assemblyai?session_id=${sessionId}`;
            this.logger.log(`Submitting transcription with webhook: ${webhookUrl}`);
            const audioHours = await this.subscriptionsService.calculateAudioDurationFromBuffer(audioBuffer, mimeType);
            try {
                const limitCheck = await this.subscriptionsService.checkAudioLimit(session.userId, audioHours);
                if (!limitCheck.allowed) {
                    this.logger.warn(`Audio limit exceeded for user ${session.userId}. Current: ${limitCheck.currentUsage}, Limit: ${limitCheck.limit}`);
                    throw new Error(`Audio limit exceeded. You have used ${limitCheck.currentUsage.toFixed(2)} of ${limitCheck.limit} hours. Please upgrade your plan.`);
                }
            }
            catch (error) {
                if (error.message.includes('limit exceeded')) {
                    throw error;
                }
                this.logger.warn(`Could not check audio limit: ${error.message}`);
            }
            const transcript = await assemblyaiClient.transcripts.submit({
                audio: audioBuffer,
                speaker_labels: true,
                speakers_expected: 4,
                language_code: 'en',
                webhook_url: webhookUrl,
            });
            this.logger.log(`Transcription submitted for session ${sessionId}. Transcript ID: ${transcript.id}, Status: ${transcript.status}`);
        }
        catch (error) {
            this.logger.error(`Error submitting audio for session ${sessionId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleAssemblyAIWebhook(payload) {
        this.logger.log(`Received AssemblyAI webhook: ${JSON.stringify(payload).substring(0, 200)}`);
        try {
            const webhookUrl = payload.webhook_url || '';
            const urlMatch = webhookUrl.match(/session_id=(\d+)/);
            const sessionId = urlMatch ? parseInt(urlMatch[1], 10) : null;
            if (!sessionId) {
                this.logger.error('Could not extract session_id from webhook payload');
                return { status: 'error', message: 'Session ID not found in webhook' };
            }
            const session = await this.findById(sessionId);
            if (!session) {
                this.logger.error(`Session ${sessionId} from webhook not found`);
                return { status: 'error', message: `Session ${sessionId} not found` };
            }
            if (payload.status === 'error') {
                this.logger.error(`Transcription failed for session ${sessionId}: ${payload.error}`);
                return { status: 'error', message: `Transcription failed: ${payload.error}` };
            }
            if (payload.status !== 'completed') {
                this.logger.log(`Transcription still processing for session ${sessionId}: ${payload.status}`);
                return { status: 'processing', message: `Transcription status: ${payload.status}` };
            }
            const apiKey = this.configService.get('ASSEMBLYAI_API_KEY');
            if (!apiKey) {
                this.logger.error('AssemblyAI API key not configured');
                return { status: 'error', message: 'API key not configured' };
            }
            const assemblyaiClient = new assemblyai_1.AssemblyAI({ apiKey });
            const transcript = await assemblyaiClient.transcripts.get(payload.transcript_id);
            if (!transcript || transcript.status !== 'completed') {
                this.logger.error(`Failed to fetch completed transcript ${payload.transcript_id}`);
                return { status: 'error', message: 'Failed to fetch transcript' };
            }
            if (transcript.audio_duration !== undefined && transcript.audio_duration !== null) {
                const audioHours = transcript.audio_duration / 3600;
                try {
                    await this.subscriptionsService.incrementAudioUsage(session.userId, audioHours);
                    this.logger.log(`Tracked ${audioHours.toFixed(2)} hours of audio usage for user ${session.userId}`);
                }
                catch (error) {
                    this.logger.warn(`Failed to track audio usage: ${error.message}`);
                }
            }
            await this.updateTranscriptsWithSpeakerLabels(sessionId, transcript);
            this.logger.log(`Successfully processed speaker diarization webhook for session ${sessionId}`);
            return { status: 'success', message: 'Speaker labels updated successfully' };
        }
        catch (error) {
            this.logger.error(`Error handling webhook: ${error.message}`, error.stack);
            return { status: 'error', message: error.message };
        }
    }
    async reprocessSessionWithSpeakerDiarization(sessionId) {
        return {
            message: 'Audio reprocessing requires audio file storage. Please upload audio file directly.',
        };
    }
    async updateTranscriptsWithSpeakerLabels(sessionId, transcriptResult) {
        if (!transcriptResult.utterances || transcriptResult.utterances.length === 0) {
            this.logger.warn(`No utterances found in transcript result for session ${sessionId}`);
            return;
        }
        const existingTranscripts = await this.transcriptsService.findBySessionId(sessionId);
        const finalTranscripts = existingTranscripts.filter((t) => !t.isInterim);
        if (finalTranscripts.length === 0) {
            this.logger.warn(`No existing transcripts found for session ${sessionId}`);
            return;
        }
        const utteranceMap = new Map();
        for (const utterance of transcriptResult.utterances) {
            const text = utterance.text?.trim().toLowerCase();
            if (text) {
                utteranceMap.set(text, utterance.speaker || 'A');
            }
        }
        let updatedCount = 0;
        let errorCount = 0;
        const originalCount = finalTranscripts.length;
        for (const transcript of finalTranscripts) {
            try {
                const transcriptText = transcript.text?.trim().toLowerCase();
                if (!transcriptText)
                    continue;
                let bestMatch = null;
                for (const [utteranceText, speaker] of utteranceMap.entries()) {
                    const similarity = this.calculateTextSimilarity(transcriptText, utteranceText);
                    if (!bestMatch || similarity > bestMatch.similarity) {
                        bestMatch = { speaker, similarity };
                    }
                }
                if (bestMatch && bestMatch.similarity > 0.3) {
                    if (transcript.speaker !== bestMatch.speaker) {
                        await this.transcriptsService.update(transcript.id, {
                            speaker: bestMatch.speaker,
                        });
                        updatedCount++;
                    }
                }
                else {
                    this.logger.debug(`No good match found for transcript ${transcript.id} (best similarity: ${bestMatch?.similarity || 0})`);
                }
            }
            catch (error) {
                errorCount++;
                this.logger.error(`Failed to update transcript ${transcript.id} for session ${sessionId}: ${error.message}`);
            }
        }
        const transcriptsAfter = await this.transcriptsService.findBySessionId(sessionId);
        const finalAfter = transcriptsAfter.filter((t) => !t.isInterim);
        if (finalAfter.length < originalCount) {
            this.logger.error(`WARNING: Transcript count decreased from ${originalCount} to ${finalAfter.length} for session ${sessionId}`);
        }
        this.logger.log(`Updated ${updatedCount} out of ${originalCount} transcripts with speaker labels for session ${sessionId} (${errorCount} errors)`);
    }
    calculateTextSimilarity(text1, text2) {
        const words1 = new Set(text1.split(/\s+/).filter((w) => w.length > 0));
        const words2 = new Set(text2.split(/\s+/).filter((w) => w.length > 0));
        if (words1.size === 0 && words2.size === 0)
            return 1.0;
        if (words1.size === 0 || words2.size === 0)
            return 0.0;
        const intersection = new Set([...words1].filter((x) => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        return intersection.size / union.size;
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = SessionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        patients_service_1.PatientsService,
        transcripts_service_1.TranscriptsService,
        config_1.ConfigService,
        subscriptions_service_1.SubscriptionsService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map