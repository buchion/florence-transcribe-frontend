import { Repository } from 'typeorm';
import { Session } from '../sessions/entities/session.entity';
import { SOAPNote } from '../soap/entities/soap-note.entity';
import { ExportLog, ExportStatus } from '../export/entities/export-log.entity';
export declare class AdminService {
    private sessionsRepository;
    private soapNotesRepository;
    private exportLogsRepository;
    constructor(sessionsRepository: Repository<Session>, soapNotesRepository: Repository<SOAPNote>, exportLogsRepository: Repository<ExportLog>);
    getSessions(skip?: number, limit?: number, userId?: number): Promise<{
        sessions: any[];
        total: number;
    }>;
    getNotes(skip?: number, limit?: number): Promise<{
        notes: any[];
        total: number;
    }>;
    getExportLogs(skip?: number, limit?: number, status?: ExportStatus): Promise<{
        logs: any[];
        total: number;
    }>;
    getStats(): Promise<{
        total_sessions: number;
        total_notes: number;
        total_exports: number;
        successful_exports: number;
        export_success_rate: number;
    }>;
}
