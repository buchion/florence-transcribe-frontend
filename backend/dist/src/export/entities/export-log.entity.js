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
exports.ExportLog = exports.ExportStatus = void 0;
const typeorm_1 = require("typeorm");
const soap_note_entity_1 = require("../../soap/entities/soap-note.entity");
var ExportStatus;
(function (ExportStatus) {
    ExportStatus["PENDING"] = "pending";
    ExportStatus["RETRYING"] = "retrying";
    ExportStatus["SUCCESS"] = "success";
    ExportStatus["FAILED"] = "failed";
})(ExportStatus || (exports.ExportStatus = ExportStatus = {}));
let ExportLog = class ExportLog {
};
exports.ExportLog = ExportLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ExportLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'soap_note_id' }),
    __metadata("design:type", Number)
], ExportLog.prototype, "soapNoteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => soap_note_entity_1.SOAPNote, (soapNote) => soapNote.exportLogs),
    (0, typeorm_1.JoinColumn)({ name: 'soap_note_id' }),
    __metadata("design:type", soap_note_entity_1.SOAPNote)
], ExportLog.prototype, "soapNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ehr_provider' }),
    __metadata("design:type", String)
], ExportLog.prototype, "ehrProvider", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ExportStatus,
        default: ExportStatus.PENDING,
    }),
    __metadata("design:type", String)
], ExportLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fhir_bundle', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ExportLog.prototype, "fhirBundle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ExportLog.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ExportLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], ExportLog.prototype, "updatedAt", void 0);
exports.ExportLog = ExportLog = __decorate([
    (0, typeorm_1.Entity)('export_logs')
], ExportLog);
//# sourceMappingURL=export-log.entity.js.map