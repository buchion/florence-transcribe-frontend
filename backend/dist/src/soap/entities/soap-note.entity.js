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
exports.SOAPNote = void 0;
const typeorm_1 = require("typeorm");
const clinical_extraction_entity_1 = require("../../clinical/entities/clinical-extraction.entity");
const export_log_entity_1 = require("../../export/entities/export-log.entity");
let SOAPNote = class SOAPNote {
};
exports.SOAPNote = SOAPNote;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SOAPNote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'extraction_id', nullable: true }),
    __metadata("design:type", Number)
], SOAPNote.prototype, "extractionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => clinical_extraction_entity_1.ClinicalExtraction, (extraction) => extraction.soapNotes, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'extraction_id' }),
    __metadata("design:type", clinical_extraction_entity_1.ClinicalExtraction)
], SOAPNote.prototype, "extraction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'html_content', type: 'text' }),
    __metadata("design:type", String)
], SOAPNote.prototype, "htmlContent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'billing_codes', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], SOAPNote.prototype, "billingCodes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], SOAPNote.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => export_log_entity_1.ExportLog, (exportLog) => exportLog.soapNote),
    __metadata("design:type", Array)
], SOAPNote.prototype, "exportLogs", void 0);
exports.SOAPNote = SOAPNote = __decorate([
    (0, typeorm_1.Entity)('soap_notes')
], SOAPNote);
//# sourceMappingURL=soap-note.entity.js.map