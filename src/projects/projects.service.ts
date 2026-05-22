// src/projects/projects.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly repo: Repository<Project>,
  ) {}

  create(userId: string, name: string, description?: string) {
    const project = this.repo.create({ name, description, owner_id: userId });
    return this.repo.save(project);
  }

  findAll(userId: string) {
    // Users only see their own projects
    return this.repo.find({ where: { owner_id: userId } });
  }

  async findOne(id: string, userId: string) {
    const project = await this.repo.findOne({ where: { id }, relations: ['tasks'] });
    if (!project) throw new NotFoundException('Project not found');
    if (project.owner_id !== userId) throw new ForbiddenException();
    return project;
  }

  async update(id: string, userId: string, attrs: Partial<{ name: string; description: string }>) {
    const project = await this.findOne(id, userId); // verifies ownership
    Object.assign(project, attrs);
    return this.repo.save(project);
  }

  async remove(id: string, userId: string) {
    const project = await this.findOne(id, userId); // verifies ownership
    await this.repo.remove(project);
    return { message: 'Deleted' };
  }
}