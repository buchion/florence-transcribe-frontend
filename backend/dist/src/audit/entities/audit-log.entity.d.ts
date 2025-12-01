export declare enum AuditAction {
    VIEW = "VIEW",
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    EXPORT = "EXPORT",
    REDACT = "REDACT",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT"
}
export declare enum AuditResourceType {
    PATIENT = "PATIENT",
    TRANSCRIPT = "TRANSCRIPT",
    SOAP_NOTE = "SOAP_NOTE",
    CLINICAL_EXTRACTION = "CLINICAL_EXTRACTION",
    SESSION = "SESSION",
    USER = "USER",
    AUTH = "AUTH"
}
export declare class AuditLog {
    id: number;
    userId: number;
    userEmail: string;
    sessionId: number;
    patientId: number;
    action: AuditAction;
    resourceType: AuditResourceType;
    resourceId: number;
    metadata: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    requestPath: string;
    requestMethod: string;
    createdAt: Date;
}
