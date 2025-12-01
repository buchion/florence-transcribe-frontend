import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { Session } from '../sessions/entities/session.entity';
import { User } from '../users/entities/user.entity';
export declare class PatientsMigrationService implements OnModuleInit {
    private patientsRepository;
    private sessionsRepository;
    private usersRepository;
    private readonly logger;
    constructor(patientsRepository: Repository<Patient>, sessionsRepository: Repository<Session>, usersRepository: Repository<User>);
    onModuleInit(): Promise<void>;
    migratePatientsUserId(): Promise<void>;
}
