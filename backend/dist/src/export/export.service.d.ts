import { Repository } from 'typeorm';
import { ExportLog } from './entities/export-log.entity';
import { SOAPNote } from '../soap/entities/soap-note.entity';
import { ClinicalExtraction } from '../clinical/entities/clinical-extraction.entity';
import { FhirMapperService } from './fhir-mapper.service';
export declare class ExportService {
    private exportLogRepository;
    private soapNoteRepository;
    private clinicalExtractionRepository;
    private fhirMapper;
    private baseUrls;
    constructor(exportLogRepository: Repository<ExportLog>, soapNoteRepository: Repository<SOAPNote>, clinicalExtractionRepository: Repository<ClinicalExtraction>, fhirMapper: FhirMapperService);
    export(soapNoteId: number, ehrProvider: string, patientId: string, practitionerId: string, clientId?: string, clientSecret?: string): Promise<{
        export_log_id: number;
        status: string;
        fhir_bundle: any;
        error_message: string | null;
        created_at: string;
    }>;
    private validateBundle;
    private sleep;
}
