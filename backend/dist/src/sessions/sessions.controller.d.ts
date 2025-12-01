import { SessionsService } from './sessions.service';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    handleAssemblyAIWebhook(payload: any, sessionIdParam?: string): Promise<{
        status: string;
        message: string;
    }>;
    uploadAudio(file: Express.Multer.File, sessionId: string): Promise<{
        message: string;
        sessionId: number;
    }>;
    reprocessSpeakers(sessionId: number): Promise<{
        message: string;
    }>;
}
