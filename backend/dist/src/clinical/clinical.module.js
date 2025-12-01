"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicalModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const clinical_controller_1 = require("./clinical.controller");
const clinical_service_1 = require("./clinical.service");
const clinical_extraction_entity_1 = require("./entities/clinical-extraction.entity");
const transcripts_module_1 = require("../transcripts/transcripts.module");
let ClinicalModule = class ClinicalModule {
};
exports.ClinicalModule = ClinicalModule;
exports.ClinicalModule = ClinicalModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([clinical_extraction_entity_1.ClinicalExtraction]),
            transcripts_module_1.TranscriptsModule,
        ],
        controllers: [clinical_controller_1.ClinicalController],
        providers: [clinical_service_1.ClinicalService],
        exports: [clinical_service_1.ClinicalService],
    })
], ClinicalModule);
//# sourceMappingURL=clinical.module.js.map