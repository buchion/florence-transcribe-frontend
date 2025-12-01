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
exports.Patient = void 0;
const typeorm_1 = require("typeorm");
const session_entity_1 = require("../../sessions/entities/session.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const typeorm_encrypt_transformer_1 = require("../../common/typeorm-encrypt.transformer");
let Patient = class Patient {
};
exports.Patient = Patient;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Patient.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    __metadata("design:type", Number)
], Patient.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Patient.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name', nullable: false }),
    __metadata("design:type", String)
], Patient.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name', nullable: false }),
    __metadata("design:type", String)
], Patient.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        transformer: (0, typeorm_encrypt_transformer_1.createEncryptTransformer)(),
    }),
    __metadata("design:type", String)
], Patient.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'phone_number',
        nullable: false,
        transformer: (0, typeorm_encrypt_transformer_1.createEncryptTransformer)(),
    }),
    __metadata("design:type", String)
], Patient.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_of_birth', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Patient.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        transformer: (0, typeorm_encrypt_transformer_1.createEncryptTransformer)(),
    }),
    __metadata("design:type", String)
], Patient.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_of_kin', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "nextOfKin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_details', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "insuranceDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'national_id',
        nullable: true,
        transformer: (0, typeorm_encrypt_transformer_1.createEncryptTransformer)(),
    }),
    __metadata("design:type", String)
], Patient.prototype, "nationalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "ethnicity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'past_medical_history', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "pastMedicalHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'family_medical_history', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "familyMedicalHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lifestyle_factors', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "lifestyleFactors", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_medications', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "currentMedications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "allergies", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'past_surgeries', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "pastSurgeries", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Patient.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Patient.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => session_entity_1.Session, (session) => session.patient),
    __metadata("design:type", Array)
], Patient.prototype, "sessions", void 0);
exports.Patient = Patient = __decorate([
    (0, typeorm_1.Entity)('patients')
], Patient);
//# sourceMappingURL=patient.entity.js.map