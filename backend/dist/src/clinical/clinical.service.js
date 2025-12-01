"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicalService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const clinical_extraction_entity_1 = require("./entities/clinical-extraction.entity");
const transcripts_service_1 = require("../transcripts/transcripts.service");
const openai_1 = __importDefault(require("openai"));
let ClinicalService = class ClinicalService {
    constructor(clinicalExtractionRepository, transcriptsService, configService) {
        this.clinicalExtractionRepository = clinicalExtractionRepository;
        this.transcriptsService = transcriptsService;
        this.configService = configService;
        const openaiApiKey = this.configService.get("OPENAI_API_KEY") || "";
        if (!openaiApiKey) {
            throw new common_1.BadRequestException("OpenAI API key not configured");
        }
        this.openai = new openai_1.default({
            apiKey: openaiApiKey,
        });
    }
    async extract(transcriptText, sessionId) {
        console.log("sessionId", sessionId);
        const systemPrompt = `You are a medical transcription AI that extracts structured clinical information from doctor-patient conversations.

Extract the following information:
1. Problems/Diagnoses: Chief complaints, diagnoses mentioned
2. Medications: All medications mentioned with dosage, frequency, route
3. Orders: Lab tests, imaging studies, procedures ordered
4. Vital Signs: Blood pressure, temperature, heart rate, etc.
5. ICD-10 codes: Map diagnoses to ICD-10 codes
6. CPT codes: Map procedures/orders to CPT codes

Return a JSON object with this exact structure:
{
  "problems": [{"description": "...", "icd10_code": "...", "confidence": 0.0-1.0}],
  "medications": [{"name": "...", "dosage": "...", "frequency": "...", "route": "...", "normalized_name": "..."}],
  "orders": [{"type": "lab|imaging|procedure", "description": "...", "cpt_code": "...", "confidence": 0.0-1.0}],
  "vitals": [{"type": "...", "value": "...", "unit": "...", "normalized_value": 0.0}],
  "icd10_codes": [{"code": "...", "description": "...", "confidence": 0.0-1.0}],
  "cpt_codes": [{"code": "...", "description": "...", "confidence": 0.0-1.0}]
}

Be thorough and extract all clinical information. Use null for missing fields.`;
        const userPrompt = `Extract clinical information from this medical transcript:\n\n${transcriptText}`;
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                response_format: { type: "json_object" },
                temperature: 0.1,
            });
            console.log("response", completion);
            const extractionData = completion.choices[0].message.content;
            if (!extractionData) {
                throw new common_1.BadRequestException("No content returned from OpenAI");
            }
            const jsonData = JSON.parse(extractionData);
            if (sessionId) {
                const transcripts = await this.transcriptsService.findBySessionId(sessionId);
                if (transcripts.length === 0) {
                    throw new common_1.NotFoundException("Transcript not found");
                }
                const transcript = transcripts[transcripts.length - 1];
                const clinicalExtraction = this.clinicalExtractionRepository.create({
                    transcriptId: transcript.id,
                    jsonData,
                });
                await this.clinicalExtractionRepository.save(clinicalExtraction);
            }
            return {
                ...jsonData,
                created_at: new Date().toISOString(),
            };
        }
        catch (error) {
            console.log("error", error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            if (error instanceof Error) {
                const errorMessage = error.message;
                throw new common_1.BadRequestException(`Failed to extract clinical data: ${errorMessage}`);
            }
            throw new common_1.BadRequestException(`Failed to extract clinical data: ${String(error)}`);
        }
    }
};
exports.ClinicalService = ClinicalService;
exports.ClinicalService = ClinicalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(clinical_extraction_entity_1.ClinicalExtraction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        transcripts_service_1.TranscriptsService,
        config_1.ConfigService])
], ClinicalService);
//# sourceMappingURL=clinical.service.js.map