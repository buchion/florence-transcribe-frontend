import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session, SessionStatus } from './entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
  ) {}

  async create(sessionData: Partial<Session>): Promise<Session> {
    const session = this.sessionsRepository.create(sessionData);
    return this.sessionsRepository.save(session);
  }

  async findById(id: number): Promise<Session | null> {
    return this.sessionsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(
    userId: number,
    skip: number = 0,
    limit: number = 100,
  ): Promise<[Session[], number]> {
    return this.sessionsRepository.findAndCount({
      where: { userId },
      relations: ['user'],
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
      relations: ['user'],
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

