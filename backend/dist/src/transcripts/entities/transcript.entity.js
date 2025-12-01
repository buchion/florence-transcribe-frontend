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
exports.Transcript = void 0;
const typeorm_1 = require("typeorm");
const session_entity_1 = require("../../sessions/entities/session.entity");
const clinical_extraction_entity_1 = require("../../clinical/entities/clinical-extraction.entity");
const typeorm_encrypt_transformer_1 = require("../../common/typeorm-encrypt.transformer");
let Transcript = class Transcript {
};
exports.Transcript = Transcript;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Transcript.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'session_id' }),
    __metadata("design:type", Number)
], Transcript.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => session_entity_1.Session, (session) => session.transcripts),
    (0, typeorm_1.JoinColumn)({ name: 'session_id' }),
    __metadata("design:type", session_entity_1.Session)
], Transcript.prototype, "session", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        transformer: (0, typeorm_encrypt_transformer_1.createEncryptTransformer)(),
    }),
    __metadata("design:type", String)
], Transcript.prototype, "text", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_interim', default: false }),
    __metadata("design:type", Boolean)
], Transcript.prototype, "isInterim", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Transcript.prototype, "speaker", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Transcript.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => clinical_extraction_entity_1.ClinicalExtraction, (extraction) => extraction.transcript),
    __metadata("design:type", Array)
], Transcript.prototype, "clinicalExtractions", void 0);
exports.Transcript = Transcript = __decorate([
    (0, typeorm_1.Entity)('transcripts')
], Transcript);
//# sourceMappingURL=transcript.entity.js.map