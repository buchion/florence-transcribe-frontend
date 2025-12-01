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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicalExtraction = void 0;
const typeorm_1 = require("typeorm");
const transcript_entity_1 = require("../../transcripts/entities/transcript.entity");
const soap_note_entity_1 = require("../../soap/entities/soap-note.entity");
let ClinicalExtraction = class ClinicalExtraction {
};
exports.ClinicalExtraction = ClinicalExtraction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ClinicalExtraction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transcript_id' }),
    __metadata("design:type", Number)
], ClinicalExtraction.prototype, "transcriptId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transcript_entity_1.Transcript, (transcript) => transcript.clinicalExtractions),
    (0, typeorm_1.JoinColumn)({ name: 'transcript_id' }),
    __metadata("design:type", transcript_entity_1.Transcript)
], ClinicalExtraction.prototype, "transcript", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'json_data', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ClinicalExtraction.prototype, "jsonData", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ClinicalExtraction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => soap_note_entity_1.SOAPNote, (soapNote) => soapNote.extraction),
    __metadata("design:type", Array)
], ClinicalExtraction.prototype, "soapNotes", void 0);
exports.ClinicalExtraction = ClinicalExtraction = __decorate([
    (0, typeorm_1.Entity)('clinical_extractions')
], ClinicalExtraction);
//# sourceMappingURL=clinical-extraction.entity.js.map