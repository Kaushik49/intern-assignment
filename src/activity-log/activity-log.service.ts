import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';

@Injectable()
export class ActivityLogService {

  constructor(
    @InjectRepository(ActivityLog)
    private readonly repo: Repository<ActivityLog>,
  ) { }


  async create(data: Partial<ActivityLog>): Promise<ActivityLog> {
    const log = this.repo.create(data);
    return this.repo.save(log);
  }

  async findAll(): Promise<ActivityLog[]> {
    return this.repo.find({ order: { timestamp: 'DESC' } });
  }

  async findOne(id: string): Promise<ActivityLog> {
    const log = await this.repo.findOne({ where: { id } });
    if (!log) throw new NotFoundException('Log entry not found');
    return log;
  }
}
