import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Session, SessionStatus } from './entities/session.entity';
import { PatientsService } from '../patients/patients.service';
import { TranscriptsService } from '../transcripts/transcripts.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
export declare class SessionsService {
    private sessionsRepository;
    private patientsService;
    private transcriptsService;
    private configService;
    private subscriptionsService;
    private readonly logger;
    constructor(sessionsRepository: Repository<Session>, patientsService: PatientsService, transcriptsService: TranscriptsService, configService: ConfigService, subscriptionsService: SubscriptionsService);
    create(sessionData: Partial<Session>): Promise<Session>;
    findById(id: number): Promise<Session | null>;
    findByUserId(userId: number, skip?: number, limit?: number): Promise<[Session[], number]>;
    findAll(skip?: number, limit?: number, userId?: number): Promise<[Session[], number]>;
    updateStatus(id: number, status: SessionStatus, endedAt?: Date): Promise<Session>;
    processAudioWithSpeakerDiarization(sessionId: number, audioBuffer: Buffer, mimeType: string): Promise<void>;
    handleAssemblyAIWebhook(payload: any): Promise<{
        status: string;
        message: string;
    }>;
    reprocessSessionWithSpeakerDiarization(sessionId: number): Promise<{
        message: string;
    }>;
    private updateTranscriptsWithSpeakerLabels;
    private calculateTextSimilarity;
}
