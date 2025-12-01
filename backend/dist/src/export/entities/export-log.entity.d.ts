import { SOAPNote } from '../../soap/entities/soap-note.entity';
export declare enum ExportStatus {
    PENDING = "pending",
    RETRYING = "retrying",
    SUCCESS = "success",
    FAILED = "failed"
}
export declare class ExportLog {
    id: number;
    soapNoteId: number;
    soapNote: SOAPNote;
    ehrProvider: string;
    status: ExportStatus;
    fhirBundle: any;
    errorMessage: string;
    createdAt: Date;
    updatedAt: Date;
}
