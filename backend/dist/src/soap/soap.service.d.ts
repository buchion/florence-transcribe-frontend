import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { SOAPNote } from './entities/soap-note.entity';
import { ClinicalExtraction } from '../clinical/entities/clinical-extraction.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
export declare class SoapService {
    private soapNoteRepository;
    private clinicalExtractionRepository;
    private configService;
    private subscriptionsService;
    private openai;
    constructor(soapNoteRepository: Repository<SOAPNote>, clinicalExtractionRepository: Repository<ClinicalExtraction>, configService: ConfigService, subscriptionsService: SubscriptionsService);
    compose(extractionId: number | undefined, clinicalExtraction: any | undefined, transcriptText: string | undefined, userId: number): Promise<{
        soap_note_id: number;
        html_content: string;
        billing_codes: any;
        created_at: string;
    }>;
    private buildContext;
    private formatHtml;
    private buildBillingCodes;
}
