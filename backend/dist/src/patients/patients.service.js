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
exports.PatientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_entity_1 = require("./entities/patient.entity");
const uuid_1 = require("uuid");
let PatientsService = class PatientsService {
    constructor(patientsRepository) {
        this.patientsRepository = patientsRepository;
    }
    async create(createPatientDto, userId) {
        try {
            if (!createPatientDto.patientId) {
                createPatientDto.patientId = (0, uuid_1.v4)();
            }
            const existingPatient = await this.patientsRepository.findOne({
                where: { patientId: createPatientDto.patientId, userId },
            });
            if (existingPatient) {
                throw new common_1.BadRequestException('Patient ID already exists');
            }
            const patientData = { ...createPatientDto, userId };
            if (createPatientDto.dateOfBirth) {
                patientData.dateOfBirth = new Date(createPatientDto.dateOfBirth);
            }
            const optionalStringFields = [
                'email', 'gender', 'address', 'nationalId', 'ethnicity',
                'pastMedicalHistory', 'familyMedicalHistory', 'currentMedications',
                'allergies', 'pastSurgeries'
            ];
            for (const field of optionalStringFields) {
                if (patientData[field] === '') {
                    patientData[field] = null;
                }
            }
            if (patientData.nextOfKin && typeof patientData.nextOfKin === 'string') {
                try {
                    patientData.nextOfKin = JSON.parse(patientData.nextOfKin);
                }
                catch (e) {
                    patientData.nextOfKin = null;
                }
            }
            if (patientData.insuranceDetails && typeof patientData.insuranceDetails === 'string') {
                try {
                    patientData.insuranceDetails = JSON.parse(patientData.insuranceDetails);
                }
                catch (e) {
                    patientData.insuranceDetails = null;
                }
            }
            if (patientData.lifestyleFactors && typeof patientData.lifestyleFactors === 'string') {
                try {
                    patientData.lifestyleFactors = JSON.parse(patientData.lifestyleFactors);
                }
                catch (e) {
                    patientData.lifestyleFactors = null;
                }
            }
            const patient = this.patientsRepository.create(patientData);
            const savedPatient = await this.patientsRepository.save(patient);
            return (Array.isArray(savedPatient) ? savedPatient[0] : savedPatient);
        }
        catch (error) {
            console.error('[PatientsService] Error creating patient:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            if (error instanceof Error && error.message.includes('duplicate key')) {
                throw new common_1.BadRequestException('A patient with this information already exists');
            }
            throw new common_1.BadRequestException(`Failed to create patient: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async findAll(skip = 0, limit = 100, search, userId) {
        const queryBuilder = this.patientsRepository.createQueryBuilder('patient');
        if (userId) {
            queryBuilder.where('patient.userId = :userId', { userId });
        }
        if (search) {
            const searchCondition = userId
                ? '(patient.userId = :userId AND (LOWER(patient.firstName) LIKE LOWER(:search) OR LOWER(patient.lastName) LIKE LOWER(:search) OR LOWER(CONCAT(patient.firstName, \' \', patient.lastName)) LIKE LOWER(:search)))'
                : '(LOWER(patient.firstName) LIKE LOWER(:search) OR LOWER(patient.lastName) LIKE LOWER(:search) OR LOWER(CONCAT(patient.firstName, \' \', patient.lastName)) LIKE LOWER(:search))';
            queryBuilder.where(searchCondition, {
                search: `%${search}%`,
                ...(userId && { userId })
            });
        }
        queryBuilder.skip(skip).take(limit).orderBy('patient.createdAt', 'DESC');
        return queryBuilder.getManyAndCount();
    }
    async findOne(id, userId) {
        const where = { id };
        if (userId) {
            where.userId = userId;
        }
        const patient = await this.patientsRepository.findOne({
            where,
            relations: ['sessions'],
        });
        if (!patient) {
            throw new common_1.NotFoundException(`Patient with ID ${id} not found`);
        }
        return patient;
    }
    async findByPatientId(patientId, userId) {
        const where = { patientId };
        if (userId) {
            where.userId = userId;
        }
        return this.patientsRepository.findOne({
            where,
        });
    }
    async search(searchQuery, userId) {
        const where = [
            { firstName: (0, typeorm_2.ILike)(`%${searchQuery}%`) },
            { lastName: (0, typeorm_2.ILike)(`%${searchQuery}%`) },
        ];
        if (userId) {
            where.forEach(condition => {
                condition.userId = userId;
            });
        }
        return this.patientsRepository.find({
            where,
            take: 50,
            order: { createdAt: 'DESC' },
        });
    }
    async update(id, updatePatientDto, userId) {
        const patient = await this.findOne(id, userId);
        if (updatePatientDto.patientId && updatePatientDto.patientId !== patient.patientId) {
            const where = { patientId: updatePatientDto.patientId };
            if (userId) {
                where.userId = userId;
            }
            const existingPatient = await this.patientsRepository.findOne({
                where,
            });
            if (existingPatient) {
                throw new common_1.BadRequestException('Patient ID already exists');
            }
        }
        const updateData = { ...updatePatientDto };
        if (updatePatientDto.dateOfBirth) {
            updateData.dateOfBirth = new Date(updatePatientDto.dateOfBirth);
        }
        Object.assign(patient, updateData);
        return this.patientsRepository.save(patient);
    }
    async getPatientSessions(id, userId) {
        const where = { id };
        if (userId) {
            where.userId = userId;
        }
        const patient = await this.patientsRepository.findOne({
            where,
            relations: ['sessions', 'sessions.transcripts'],
        });
        if (!patient) {
            throw new common_1.NotFoundException(`Patient with ID ${id} not found`);
        }
        return patient;
    }
    async importFromCSV(file) {
        throw new common_1.BadRequestException('CSV import not yet implemented. Please install csv-parse package.');
    }
    async importFromExcel(file) {
        throw new common_1.BadRequestException('Excel import not yet implemented. Please install xlsx or exceljs package.');
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PatientsService);
//# sourceMappingURL=patients.service.js.map