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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const export_log_entity_1 = require("./entities/export-log.entity");
const soap_note_entity_1 = require("../soap/entities/soap-note.entity");
const clinical_extraction_entity_1 = require("../clinical/entities/clinical-extraction.entity");
const fhir_mapper_service_1 = require("./fhir-mapper.service");
let ExportService = class ExportService {
    constructor(exportLogRepository, soapNoteRepository, clinicalExtractionRepository, fhirMapper) {
        this.exportLogRepository = exportLogRepository;
        this.soapNoteRepository = soapNoteRepository;
        this.clinicalExtractionRepository = clinicalExtractionRepository;
        this.fhirMapper = fhirMapper;
        this.baseUrls = {
            epic: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
            cerner: 'https://fhir.cerner.com/millennium/r4',
            office_ally: 'https://api.officeally.com/fhir/r4',
        };
    }
    async export(soapNoteId, ehrProvider, patientId, practitionerId, clientId, clientSecret) {
        const soapNote = await this.soapNoteRepository.findOne({
            where: { id: soapNoteId },
        });
        if (!soapNote) {
            throw new common_1.NotFoundException('SOAP note not found');
        }
        const extraction = await this.clinicalExtractionRepository.findOne({
            where: { id: soapNote.extractionId },
        });
        if (!extraction) {
            throw new common_1.NotFoundException('Clinical extraction not found');
        }
        const fhirBundle = this.fhirMapper.mapToFhirBundle(extraction.jsonData, patientId, practitionerId);
        const exportLog = this.exportLogRepository.create({
            soapNoteId,
            ehrProvider,
            status: export_log_entity_1.ExportStatus.PENDING,
            fhirBundle,
        });
        await this.exportLogRepository.save(exportLog);
        const maxRetries = 3;
        let retryDelay = 1000;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                if (!this.validateBundle(fhirBundle)) {
                    throw new Error('Invalid FHIR bundle structure');
                }
                if (clientId && clientSecret) {
                    exportLog.status = export_log_entity_1.ExportStatus.PENDING;
                }
                else {
                    exportLog.status = export_log_entity_1.ExportStatus.PENDING;
                }
                await this.exportLogRepository.save(exportLog);
                return {
                    export_log_id: exportLog.id,
                    status: exportLog.status,
                    fhir_bundle: exportLog.fhirBundle,
                    error_message: exportLog.errorMessage,
                    created_at: exportLog.createdAt.toISOString(),
                };
            }
            catch (error) {
                if (attempt < maxRetries - 1) {
                    exportLog.status = export_log_entity_1.ExportStatus.RETRYING;
                    await this.exportLogRepository.save(exportLog);
                    await this.sleep(retryDelay * Math.pow(2, attempt));
                }
                else {
                    exportLog.status = export_log_entity_1.ExportStatus.FAILED;
                    exportLog.errorMessage = error.message;
                    await this.exportLogRepository.save(exportLog);
                    throw new common_1.InternalServerErrorException(`Export failed after ${maxRetries} attempts: ${error.message}`);
                }
            }
        }
        throw new common_1.InternalServerErrorException('Export failed');
    }
    validateBundle(bundle) {
        const requiredFields = ['resourceType', 'type', 'entry'];
        return requiredFields.every((field) => field in bundle);
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(export_log_entity_1.ExportLog)),
    __param(1, (0, typeorm_1.InjectRepository)(soap_note_entity_1.SOAPNote)),
    __param(2, (0, typeorm_1.InjectRepository)(clinical_extraction_entity_1.ClinicalExtraction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        fhir_mapper_service_1.FhirMapperService])
], ExportService);
//# sourceMappingURL=export.service.js.map