import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { User } from '../users/entities/user.entity';
export declare class PatientsController {
    private readonly patientsService;
    constructor(patientsService: PatientsService);
    create(createPatientDto: CreatePatientDto, user: User): Promise<import("./entities/patient.entity").Patient>;
    findAll(skip: number, limit: number, user: User, search?: string): Promise<{
        patients: import("./entities/patient.entity").Patient[];
        total: number;
        skip: number;
        limit: number;
    }>;
    search(query: string, user: User): Promise<import("./entities/patient.entity").Patient[]>;
    findOne(id: number, user: User): Promise<import("./entities/patient.entity").Patient>;
    getPatientSessions(id: number, user: User): Promise<{
        patient: import("./entities/patient.entity").Patient;
        sessions: import("../sessions/entities/session.entity").Session[];
    }>;
    update(id: number, updatePatientDto: UpdatePatientDto, user: User): Promise<import("./entities/patient.entity").Patient>;
    import(file: Express.Multer.File): Promise<{
        created: number;
        updated: number;
        errors: string[];
    }>;
}
