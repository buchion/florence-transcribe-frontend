import { ClinicalExtraction } from '../../clinical/entities/clinical-extraction.entity';
import { ExportLog } from '../../export/entities/export-log.entity';
export declare class SOAPNote {
    id: number;
    extractionId: number | null;
    extraction: ClinicalExtraction | null;
    htmlContent: string;
    billingCodes: {
        icd10?: string[];
        cpt?: string[];
    };
    createdAt: Date;
    exportLogs: ExportLog[];
}
