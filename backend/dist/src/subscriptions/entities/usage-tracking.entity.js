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
exports.UsageTracking = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let UsageTracking = class UsageTracking {
};
exports.UsageTracking = UsageTracking;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UsageTracking.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], UsageTracking.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UsageTracking.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'period_start', type: 'timestamptz' }),
    __metadata("design:type", Date)
], UsageTracking.prototype, "periodStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'period_end', type: 'timestamptz' }),
    __metadata("design:type", Date)
], UsageTracking.prototype, "periodEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audio_hours_used', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], UsageTracking.prototype, "audioHoursUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes_created', default: 0 }),
    __metadata("design:type", Number)
], UsageTracking.prototype, "notesCreated", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], UsageTracking.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], UsageTracking.prototype, "updatedAt", void 0);
exports.UsageTracking = UsageTracking = __decorate([
    (0, typeorm_1.Entity)('usage_tracking'),
    (0, typeorm_1.Index)(['userId', 'periodStart', 'periodEnd'])
], UsageTracking);
//# sourceMappingURL=usage-tracking.entity.js.map