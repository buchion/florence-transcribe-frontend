import { ClinicalService } from './clinical.service';
import { ClinicalizeDto } from './dto/clinicalize.dto';
import { TranscriptsService } from '../transcripts/transcripts.service';
export declare class ClinicalController {
    private clinicalService;
    private transcriptsService;
    constructor(clinicalService: ClinicalService, transcriptsService: TranscriptsService);
    clinicalize(dto: ClinicalizeDto): Promise<any>;
}
