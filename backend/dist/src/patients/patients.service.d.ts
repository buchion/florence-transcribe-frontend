import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
export declare class PatientsService {
    private patientsRepository;
    constructor(patientsRepository: Repository<Patient>);
    create(createPatientDto: CreatePatientDto, userId: number): Promise<Patient>;
    findAll(skip?: number, limit?: number, search?: string, userId?: number): Promise<[Patient[], number]>;
    findOne(id: number, userId?: number): Promise<Patient>;
    findByPatientId(patientId: string, userId?: number): Promise<Patient | null>;
    search(searchQuery: string, userId?: number): Promise<Patient[]>;
    update(id: number, updatePatientDto: UpdatePatientDto, userId?: number): Promise<Patient>;
    getPatientSessions(id: number, userId?: number): Promise<Patient>;
    importFromCSV(file: Express.Multer.File): Promise<{
        created: number;
        updated: number;
        errors: string[];
    }>;
    importFromExcel(file: Express.Multer.File): Promise<{
        created: number;
        updated: number;
        errors: string[];
    }>;
}
