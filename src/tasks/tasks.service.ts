// src/tasks/tasks.service.ts
import {
  Injectable, NotFoundException,
  ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, STATUS_TRANSITIONS } from './task.entity';
import { Project } from '../projects/project.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    private activityLogService: ActivityLogService,
  ) { }

  private async verifyProjectOwnership(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectRepo.findOneBy({ id: projectId });
    if (!project) throw new NotFoundException('Project not found');
    if (project.owner_id !== userId) throw new ForbiddenException();
    return project;
  }

  async create(userId: string, projectId: string, title: string, description?: string, assigneeId?: string) {
    await this.verifyProjectOwnership(projectId, userId);
    const task = this.taskRepo.create({
      title, description, project_id: projectId,
      assignee_id: assigneeId,
    });
    await this.taskRepo.save(task);
    await this.activityLogService.log(userId, 'TASK_CREATED', `Created task ${task.id}`);
    return task;
  }

  async findAll(userId: string, projectId: string) {
    await this.verifyProjectOwnership(projectId, userId);
    return this.taskRepo.find({ where: { project_id: projectId } });
  }

  async findOne(taskId: string, userId: string) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['project'],
    });
    if (!task) throw new NotFoundException('Task not found');
    if (task.project.owner_id !== userId) throw new ForbiddenException();
    return task;
  }

  async update(taskId: string, userId: string, attrs: Partial<{ title: string; description: string; assignee_id: string }>) {
    const task = await this.findOne(taskId, userId);
    Object.assign(task, attrs);
    return this.taskRepo.save(task);
  }

  async updateStatus(taskId: string, userId: string, newStatus: TaskStatus) {
    const task = await this.findOne(taskId, userId);

    const allowed = STATUS_TRANSITIONS[task.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from "${task.status}" to "${newStatus}". ` +
        `Allowed: [${allowed.join(', ') || 'none'}]`
      );
    }
    task.status = newStatus;
    return this.taskRepo.save(task);
  }

  async remove(taskId: string, userId: string) {
    const task = await this.findOne(taskId, userId);
    await this.taskRepo.remove(task);
    return { message: 'Deleted' };
  }
}