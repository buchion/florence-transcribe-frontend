"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const export_controller_1 = require("./export.controller");
const export_service_1 = require("./export.service");
const fhir_mapper_service_1 = require("./fhir-mapper.service");
const export_log_entity_1 = require("./entities/export-log.entity");
const soap_note_entity_1 = require("../soap/entities/soap-note.entity");
const clinical_extraction_entity_1 = require("../clinical/entities/clinical-extraction.entity");
let ExportModule = class ExportModule {
};
exports.ExportModule = ExportModule;
exports.ExportModule = ExportModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([export_log_entity_1.ExportLog, soap_note_entity_1.SOAPNote, clinical_extraction_entity_1.ClinicalExtraction]),
        ],
        controllers: [export_controller_1.ExportController],
        providers: [export_service_1.ExportService, fhir_mapper_service_1.FhirMapperService],
        exports: [export_service_1.ExportService],
    })
], ExportModule);
//# sourceMappingURL=export.module.js.map