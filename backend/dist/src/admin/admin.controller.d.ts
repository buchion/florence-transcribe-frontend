import { AdminService } from './admin.service';
import { ExportStatus } from '../export/entities/export-log.entity';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getSessions(skip: number, limit: number, userId?: string): Promise<{
        sessions: any[];
        total: number;
    }>;
    getNotes(skip: number, limit: number): Promise<{
        notes: any[];
        total: number;
    }>;
    getExportLogs(skip: number, limit: number, status?: ExportStatus): Promise<{
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
