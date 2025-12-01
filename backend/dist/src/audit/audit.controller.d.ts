import { AuditService } from './audit.service';
import { AuditResourceType } from './entities/audit-log.entity';
export declare class AuditController {
    private auditService;
    constructor(auditService: AuditService);
    getPHIAccess(limit: number, startDate?: string, endDate?: string): Promise<import("./entities/audit-log.entity").AuditLog[]>;
    getPatientLogs(patientId: number, limit: number): Promise<import("./entities/audit-log.entity").AuditLog[]>;
    getUserLogs(userId: number, limit: number): Promise<import("./entities/audit-log.entity").AuditLog[]>;
    getSessionLogs(sessionId: number, limit: number): Promise<import("./entities/audit-log.entity").AuditLog[]>;
    getResourceLogs(resourceType: AuditResourceType, resourceId: number, limit: number): Promise<import("./entities/audit-log.entity").AuditLog[]>;
    getRecentLogs(limit: number): Promise<import("./entities/audit-log.entity").AuditLog[]>;
}
