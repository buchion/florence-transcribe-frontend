import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { ClinicalExtraction } from "./entities/clinical-extraction.entity";
import { TranscriptsService } from "../transcripts/transcripts.service";
export declare class ClinicalService {
    private clinicalExtractionRepository;
    private transcriptsService;
    private configService;
    private openai;
    constructor(clinicalExtractionRepository: Repository<ClinicalExtraction>, transcriptsService: TranscriptsService, configService: ConfigService);
    extract(transcriptText: string, sessionId?: number): Promise<any>;
}
