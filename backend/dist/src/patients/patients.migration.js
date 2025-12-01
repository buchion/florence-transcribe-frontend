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
var PatientsMigrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientsMigrationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_entity_1 = require("./entities/patient.entity");
const session_entity_1 = require("../sessions/entities/session.entity");
const user_entity_1 = require("../users/entities/user.entity");
let PatientsMigrationService = PatientsMigrationService_1 = class PatientsMigrationService {
    constructor(patientsRepository, sessionsRepository, usersRepository) {
        this.patientsRepository = patientsRepository;
        this.sessionsRepository = sessionsRepository;
        this.usersRepository = usersRepository;
        this.logger = new common_1.Logger(PatientsMigrationService_1.name);
    }
    async onModuleInit() {
        await this.migratePatientsUserId();
    }
    async migratePatientsUserId() {
        try {
            const patientsWithoutUserId = await this.patientsRepository
                .createQueryBuilder('patient')
                .where('patient.userId IS NULL')
                .getMany();
            if (patientsWithoutUserId.length === 0) {
                this.logger.log('No patients need migration - all patients already have user_id');
                return;
            }
            this.logger.log(`Found ${patientsWithoutUserId.length} patients without user_id. Starting migration...`);
            let defaultUser = await this.usersRepository.findOne({
                where: { isActive: true },
                order: { id: 'ASC' },
            });
            if (!defaultUser) {
                this.logger.warn('No active users found. Cannot migrate patients.');
                return;
            }
            let migratedCount = 0;
            let assignedFromSessions = 0;
            for (const patient of patientsWithoutUserId) {
                const session = await this.sessionsRepository.findOne({
                    where: { patientEntityId: patient.id },
                    order: { createdAt: 'DESC' },
                });
                if (session && session.userId) {
                    patient.userId = session.userId;
                    assignedFromSessions++;
                }
                else {
                    patient.userId = defaultUser.id;
                }
                await this.patientsRepository.save(patient);
                migratedCount++;
            }
            this.logger.log(`Migration complete: ${migratedCount} patients migrated. ` +
                `${assignedFromSessions} assigned from sessions, ${migratedCount - assignedFromSessions} assigned to default user (${defaultUser.email})`);
        }
        catch (error) {
            this.logger.error(`Error during patients migration: ${error.message}`, error.stack);
        }
    }
};
exports.PatientsMigrationService = PatientsMigrationService;
exports.PatientsMigrationService = PatientsMigrationService = PatientsMigrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __param(1, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PatientsMigrationService);
//# sourceMappingURL=patients.migration.js.map