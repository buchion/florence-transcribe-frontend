import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session, SessionStatus } from './entities/session.entity';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
    private patientsService: PatientsService,
  ) {}

  async create(sessionData: Partial<Session>): Promise<Session> {
    // Handle Patient relationship if patientEntityId is provided
    // Otherwise, keep backward compatibility with string patientId
    const session = this.sessionsRepository.create(sessionData);
    
    // If patientEntityId is provided, ensure the patient exists and belongs to the user
    if (sessionData.patientEntityId && sessionData.userId) {
      try {
        await this.patientsService.findOne(sessionData.patientEntityId, sessionData.userId);
      } catch (error) {
        throw new Error(`Patient with ID ${sessionData.patientEntityId} not found or does not belong to user`);
      }
    }
    
    return this.sessionsRepository.save(session);
  }

  async findById(id: number): Promise<Session | null> {
    return this.sessionsRepository.findOne({
      where: { id },
      relations: ['user', 'patient'],
    });
  }

  async findByUserId(
    userId: number,
    skip: number = 0,
    limit: number = 100,
  ): Promise<[Session[], number]> {
    return this.sessionsRepository.findAndCount({
      where: { userId },
      relations: ['user', 'patient'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(
    skip: number = 0,
    limit: number = 100,
    userId?: number,
  ): Promise<[Session[], number]> {
    const where = userId ? { userId } : {};
    return this.sessionsRepository.findAndCount({
      where,
      relations: ['user', 'patient'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: number,
    status: SessionStatus,
    endedAt?: Date,
  ): Promise<Session> {
    await this.sessionsRepository.update(id, { status, endedAt });
    return this.findById(id);
  }
}

