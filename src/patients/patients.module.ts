import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { PatientsMigrationService } from './patients.migration';
import { Patient } from './entities/patient.entity';
import { Session } from '../sessions/entities/session.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Session, User])],
  controllers: [PatientsController],
  providers: [PatientsService, PatientsMigrationService],
  exports: [PatientsService],
})
export class PatientsModule {}

