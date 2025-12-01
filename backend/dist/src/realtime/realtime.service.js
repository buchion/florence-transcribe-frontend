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
var RealtimeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const transcripts_service_1 = require("../transcripts/transcripts.service");
const assemblyai_1 = require("assemblyai");
let RealtimeService = RealtimeService_1 = class RealtimeService {
    constructor(configService, transcriptsService) {
        this.configService = configService;
        this.transcriptsService = transcriptsService;
        this.logger = new common_1.Logger(RealtimeService_1.name);
        this.activeSessions = new Map();
    }
    async initializeSession(client, sessionId) {
        const clientId = client.clientId || 'unknown';
        this.logger.log(`[RealtimeService] Initializing session ${sessionId} for client ${clientId}`);
        const apiKey = this.configService.get('ASSEMBLYAI_API_KEY');
        if (!apiKey) {
            this.logger.warn(`[RealtimeService] AssemblyAI API key not configured - connection will stay open but transcription disabled`);
            const placeholderSessionId = `placeholder_${sessionId}_${Date.now()}`;
            this.activeSessions.set(sessionId, {
                client,
                sessionId: placeholderSessionId,
                audioBytesReceived: 0,
                audioChunksReceived: 0,
                startedAt: new Date(),
                assemblyaiEnabled: false,
            });
            return placeholderSessionId;
        }
        let assemblyaiSessionId;
        try {
            const assemblyaiClient = new assemblyai_1.AssemblyAI({ apiKey });
            const transcriber = assemblyaiClient.streaming.transcriber({
                sampleRate: 16000,
            });
            let assemblyaiSessionIdFromOpen = null;
            transcriber.on('open', (event) => {
                assemblyaiSessionIdFromOpen = event.id;
                this.logger.log(`[RealtimeService] AssemblyAI session opened: ${event.id}, expires at: ${event.expires_at}`);
            });
            transcriber.on('turn', (event) => {
                if (event.transcript && event.transcript.trim()) {
                    const isFinal = event.end_of_turn === true;
                    const eventAny = event;
                    const speaker = eventAny.speaker
                        || eventAny.speaker_label
                        || eventAny.speaker_id
                        || (eventAny.words && eventAny.words[0]?.speaker)
                        || undefined;
                    if (speaker) {
                        this.logger.debug(`[RealtimeService] AssemblyAI provided speaker: ${speaker} (final: ${isFinal})`);
                    }
                    this.handleTranscript(sessionId, event.transcript, isFinal, speaker).catch((error) => {
                        this.logger.error(`[RealtimeService] Error handling transcript: ${error.message}`);
                    });
                }
            });
            transcriber.on('error', (error) => {
                this.logger.error(`[RealtimeService] AssemblyAI error for session ${sessionId}: ${error.message}`, error.stack);
                try {
                    const wsClient = this.activeSessions.get(sessionId)?.client;
                    if (wsClient) {
                        wsClient.send(JSON.stringify({
                            type: 'error',
                            message: `Transcription error: ${error.message}`,
                        }));
                    }
                }
                catch (sendError) {
                    this.logger.error(`[RealtimeService] Failed to send error to client: ${sendError.message}`);
                }
            });
            transcriber.on('close', (code, reason) => {
                this.logger.log(`[RealtimeService] AssemblyAI connection closed for session ${sessionId}: ${code} - ${reason}`);
            });
            const beginEvent = await transcriber.connect();
            assemblyaiSessionId = beginEvent.id || `session_${sessionId}_${Date.now()}`;
            this.activeSessions.set(sessionId, {
                client,
                transcriber,
                sessionId: assemblyaiSessionId,
                audioBytesReceived: 0,
                audioChunksReceived: 0,
                startedAt: new Date(),
                assemblyaiEnabled: true,
                speakerDetection: {
                    lastTurnTime: null,
                    lastSpeaker: null,
                    turnHistory: [],
                    speakerPatterns: new Map(),
                },
            });
            this.logger.log(`[RealtimeService] Session ${sessionId} initialized with AssemblyAI session ${assemblyaiSessionId}`);
        }
        catch (error) {
            this.logger.error(`[RealtimeService] Failed to initialize AssemblyAI for session ${sessionId}: ${error.message}`, error.stack);
            assemblyaiSessionId = `placeholder_${sessionId}_${Date.now()}`;
            this.activeSessions.set(sessionId, {
                client,
                sessionId: assemblyaiSessionId,
                audioBytesReceived: 0,
                audioChunksReceived: 0,
                startedAt: new Date(),
                assemblyaiEnabled: false,
            });
        }
        client.on('message', async (data) => {
            if (Buffer.isBuffer(data)) {
                await this.processAudio(client, data);
            }
            else {
                this.logger.debug(`[RealtimeService] Received non-binary message from client ${clientId}: ${data.toString().substring(0, 100)}`);
            }
        });
        return assemblyaiSessionId;
    }
    async processAudio(client, audioData) {
        const sessionId = client.sessionId;
        const clientId = client.clientId || 'unknown';
        if (!sessionId) {
            this.logger.warn(`[RealtimeService] Received audio data but no session ID for client ${clientId}`);
            return;
        }
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            this.logger.warn(`[RealtimeService] Received audio data for unknown session ${sessionId}`);
            return;
        }
        if (!session.assemblyaiEnabled) {
            session.audioBytesReceived += audioData.length;
            session.audioChunksReceived += 1;
            if (session.audioChunksReceived % 100 === 0) {
                this.logger.debug(`[RealtimeService] Session ${sessionId} - Receiving audio (AssemblyAI disabled): ${session.audioChunksReceived} chunks`);
            }
            return;
        }
        session.audioBytesReceived += audioData.length;
        session.audioChunksReceived += 1;
        if (session.audioChunksReceived % 100 === 0 ||
            (Date.now() - session.startedAt.getTime()) % 10000 < 100) {
            const duration = Math.round((Date.now() - session.startedAt.getTime()) / 1000);
            this.logger.debug(`[RealtimeService] Session ${sessionId} - Audio stats: ${session.audioChunksReceived} chunks, ${(session.audioBytesReceived / 1024).toFixed(2)} KB, ${duration}s`);
        }
        if (session.transcriber) {
            try {
                const audioArray = new Uint8Array(audioData);
                session.transcriber.sendAudio(audioArray);
            }
            catch (error) {
                this.logger.error(`[RealtimeService] Error sending audio to AssemblyAI for session ${sessionId}: ${error.message}`);
            }
        }
    }
    async cleanupSession(client) {
        const sessionId = client.sessionId;
        const clientId = client.clientId || 'unknown';
        if (sessionId) {
            const session = this.activeSessions.get(sessionId);
            if (session) {
                const duration = Math.round((Date.now() - session.startedAt.getTime()) / 1000);
                this.logger.log(`[RealtimeService] Cleaning up session ${sessionId} - Total audio: ${session.audioChunksReceived} chunks, ${(session.audioBytesReceived / 1024).toFixed(2)} KB, Duration: ${duration}s`);
                if (session.transcriber) {
                    try {
                        await session.transcriber.close();
                        this.logger.debug(`[RealtimeService] Closed AssemblyAI connection for session ${sessionId}`);
                    }
                    catch (error) {
                        this.logger.error(`[RealtimeService] Error closing AssemblyAI connection: ${error.message}`);
                    }
                }
                this.activeSessions.delete(sessionId);
                this.logger.debug(`[RealtimeService] Session ${sessionId} removed from active sessions`);
            }
            else {
                this.logger.warn(`[RealtimeService] Attempted to cleanup non-existent session ${sessionId}`);
            }
        }
        else {
            this.logger.warn(`[RealtimeService] Attempted to cleanup session but no session ID for client ${clientId}`);
        }
    }
    detectSpeaker(session, text, isFinal) {
        if (!session.speakerDetection) {
            session.speakerDetection = {
                lastTurnTime: null,
                lastSpeaker: null,
                turnHistory: [],
                speakerPatterns: new Map(),
            };
        }
        const detection = session.speakerDetection;
        const now = Date.now();
        const turnLength = text.length;
        if (!isFinal) {
            return detection.lastSpeaker || 'A';
        }
        const timeSinceLastTurn = detection.lastTurnTime
            ? now - detection.lastTurnTime
            : Infinity;
        let detectedSpeaker;
        if (!detection.lastSpeaker) {
            detectedSpeaker = 'A';
        }
        else {
            const longPause = timeSinceLastTurn > 2000;
            const veryLongPause = timeSinceLastTurn > 4000;
            const recentTurns = detection.turnHistory.slice(-5);
            const lastSpeakerPattern = detection.speakerPatterns.get(detection.lastSpeaker);
            const currentSpeakerTurns = recentTurns.filter(t => t.speaker === detection.lastSpeaker);
            const avgTurnLength = currentSpeakerTurns.length > 0
                ? currentSpeakerTurns.reduce((sum, t) => sum + t.length, 0) / currentSpeakerTurns.length
                : turnLength;
            if (veryLongPause) {
                const usedSpeakers = Array.from(detection.speakerPatterns.keys()).sort();
                const speakerOrder = ['A', 'B', 'C', 'D'];
                const nextSpeaker = speakerOrder.find(s => !usedSpeakers.includes(s)) ||
                    (usedSpeakers.length < 4 ? speakerOrder[usedSpeakers.length] : 'A');
                detectedSpeaker = nextSpeaker;
            }
            else if (longPause && lastSpeakerPattern) {
                const turnLengthDiff = Math.abs(turnLength - lastSpeakerPattern.avgTurnLength);
                const significantDiff = turnLengthDiff > lastSpeakerPattern.avgTurnLength * 0.5;
                if (significantDiff) {
                    const usedSpeakers = Array.from(detection.speakerPatterns.keys()).sort();
                    const speakerOrder = ['A', 'B', 'C', 'D'];
                    const nextSpeaker = speakerOrder.find(s => !usedSpeakers.includes(s)) ||
                        (usedSpeakers.length < 4 ? speakerOrder[usedSpeakers.length] : detection.lastSpeaker);
                    detectedSpeaker = nextSpeaker;
                }
                else {
                    detectedSpeaker = detection.lastSpeaker;
                }
            }
            else if (!longPause && lastSpeakerPattern) {
                const turnLengthDiff = Math.abs(turnLength - lastSpeakerPattern.avgTurnLength);
                const similarLength = turnLengthDiff < lastSpeakerPattern.avgTurnLength * 0.3;
                if (similarLength) {
                    detectedSpeaker = detection.lastSpeaker;
                }
                else {
                    const matchingPattern = Array.from(detection.speakerPatterns.entries())
                        .find(([_, pattern]) => Math.abs(turnLength - pattern.avgTurnLength) < pattern.avgTurnLength * 0.3);
                    if (matchingPattern) {
                        detectedSpeaker = matchingPattern[0];
                    }
                    else {
                        const usedSpeakers = Array.from(detection.speakerPatterns.keys()).sort();
                        const speakerOrder = ['A', 'B', 'C', 'D'];
                        const nextSpeaker = speakerOrder.find(s => !usedSpeakers.includes(s)) ||
                            (usedSpeakers.length < 4 ? speakerOrder[usedSpeakers.length] : detection.lastSpeaker);
                        detectedSpeaker = nextSpeaker;
                    }
                }
            }
            else {
                if (longPause) {
                    const speakerOrder = ['A', 'B', 'C', 'D'];
                    const currentIndex = speakerOrder.indexOf(detection.lastSpeaker);
                    const nextIndex = (currentIndex + 1) % Math.min(4, detection.speakerPatterns.size + 1);
                    detectedSpeaker = speakerOrder[nextIndex] || 'A';
                }
                else {
                    detectedSpeaker = detection.lastSpeaker;
                }
            }
        }
        if (!detection.speakerPatterns.has(detectedSpeaker)) {
            detection.speakerPatterns.set(detectedSpeaker, {
                count: 1,
                avgTurnLength: turnLength,
                lastSeen: now,
            });
        }
        else {
            const pattern = detection.speakerPatterns.get(detectedSpeaker);
            pattern.count += 1;
            pattern.avgTurnLength = (pattern.avgTurnLength * 0.7) + (turnLength * 0.3);
            pattern.lastSeen = now;
        }
        detection.turnHistory.push({
            speaker: detectedSpeaker,
            length: turnLength,
            time: now,
        });
        if (detection.turnHistory.length > 10) {
            detection.turnHistory.shift();
        }
        detection.lastSpeaker = detectedSpeaker;
        detection.lastTurnTime = now;
        return detectedSpeaker;
    }
    async handleTranscript(sessionId, text, isFinal, speaker) {
        const session = this.activeSessions.get(sessionId);
        if (!session || !session.client) {
            this.logger.warn(`[RealtimeService] Received transcript for non-existent session ${sessionId}`);
            return;
        }
        const client = session.client;
        const clientId = client.clientId || 'unknown';
        const transcriptType = isFinal ? 'final' : 'interim';
        if (!speaker && isFinal) {
            speaker = this.detectSpeaker(session, text, isFinal);
            this.logger.debug(`[RealtimeService] Detected speaker: ${speaker} for session ${sessionId}`);
        }
        else if (!speaker) {
            speaker = session.speakerDetection?.lastSpeaker || 'A';
        }
        this.logger.debug(`[RealtimeService] Session ${sessionId} - ${transcriptType} transcript (${text.length} chars, speaker: ${speaker || 'N/A'}): "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
        if (isFinal) {
            try {
                await this.transcriptsService.create({
                    sessionId,
                    text,
                    isInterim: false,
                    speaker,
                });
                this.logger.debug(`[RealtimeService] Stored final transcript for session ${sessionId}`);
                const message = {
                    type: 'final_transcript',
                    text,
                    speaker,
                };
                client.send(JSON.stringify(message));
                this.logger.debug(`[RealtimeService] Sent final_transcript to client ${clientId}`);
            }
            catch (error) {
                this.logger.error(`[RealtimeService] Error storing final transcript: ${error.message}`, error.stack);
            }
        }
        else {
            const message = {
                type: 'interim_transcript',
                text,
                speaker,
            };
            client.send(JSON.stringify(message));
            if (Math.random() < 0.1) {
                this.logger.debug(`[RealtimeService] Sent interim_transcript to client ${clientId}`);
            }
        }
    }
};
exports.RealtimeService = RealtimeService;
exports.RealtimeService = RealtimeService = RealtimeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        transcripts_service_1.TranscriptsService])
], RealtimeService);
//# sourceMappingURL=realtime.service.js.map