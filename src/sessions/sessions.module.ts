import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsService } from './sessions.service';
import { Session } from './entities/session.entity';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [TypeOrmModule.forFeature([Session]), PatientsModule],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}

