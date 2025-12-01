import { ConfigService } from '@nestjs/config';
import { WebSocket } from 'ws';
import { TranscriptsService } from '../transcripts/transcripts.service';
export declare class RealtimeService {
    private configService;
    private transcriptsService;
    private readonly logger;
    private activeSessions;
    constructor(configService: ConfigService, transcriptsService: TranscriptsService);
    initializeSession(client: WebSocket, sessionId: number): Promise<string>;
    processAudio(client: WebSocket, audioData: Buffer): Promise<void>;
    cleanupSession(client: WebSocket): Promise<void>;
    private detectSpeaker;
    handleTranscript(sessionId: number, text: string, isFinal: boolean, speaker?: string): Promise<void>;
}
