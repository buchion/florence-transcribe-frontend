import { Request } from 'express';
import { TranscriptsService } from './transcripts.service';
import { AuditService } from '../audit/audit.service';
import { RedactionService } from '../common/redaction.service';
import { SessionsService } from '../sessions/sessions.service';
import { PatientsService } from '../patients/patients.service';
export declare class TranscriptsController {
    private transcriptsService;
    private auditService;
    private redactionService;
    private sessionsService;
    private patientsService;
    constructor(transcriptsService: TranscriptsService, auditService: AuditService, redactionService: RedactionService, sessionsService: SessionsService, patientsService: PatientsService);
    getBySessionId(sessionId: number): Promise<{
        transcripts: import("./entities/transcript.entity").Transcript[];
    }>;
    getById(id: number): Promise<{
        transcript: import("./entities/transcript.entity").Transcript;
    }>;
    getRedactedTranscript(id: number, redactNames?: string, redactPhone?: string, redactEmail?: string, redactSSN?: string, request?: Request): Promise<{
        redactedText: string;
        redactedItemsCount: number;
        originalLength: number;
        redactedLength: number;
    }>;
}
