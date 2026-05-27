import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './task.entity';
import { Project } from '../projects/project.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';

describe('TasksService', () => {
  let service: TasksService;
  let mockTaskRepo: Record<string, jest.Mock>;
  let mockProjectRepo: Record<string, jest.Mock>;
  let mockActivityLogService: Record<string, jest.Mock>;

  const userId = 'user-uuid-1';
  const otherUserId = 'user-uuid-2';
  const projectId = 'project-uuid-1';
  const taskId = 'task-uuid-1';

  const mockProject: Partial<Project> = {
    id: projectId,
    name: 'Test Project',
    owner_id: userId,
  };

  const mockTask: Partial<Task> = {
    id: taskId,
    title: 'Test Task',
    description: 'A test task',
    status: TaskStatus.PENDING,
    project_id: projectId,
    assignee_id: null,
    project: mockProject as Project,
  };

  beforeEach(async () => {
    mockTaskRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    mockProjectRepo = {
      findOneBy: jest.fn(),
    };

    mockActivityLogService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: mockTaskRepo },
        { provide: getRepositoryToken(Project), useValue: mockProjectRepo },
        { provide: ActivityLogService, useValue: mockActivityLogService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create() ──────────────────────────────────────────────────────

  describe('create()', () => {
    it('should create a task and log the activity', async () => {
      mockProjectRepo.findOneBy.mockResolvedValue(mockProject);
      const createdTask = { ...mockTask, id: 'new-task-uuid' };
      mockTaskRepo.create.mockReturnValue(createdTask);
      mockTaskRepo.save.mockResolvedValue(createdTask);

      const result = await service.create(userId, projectId, 'Test Task', 'A test task');

      expect(mockProjectRepo.findOneBy).toHaveBeenCalledWith({ id: projectId });
      expect(mockTaskRepo.create).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'A test task',
        project_id: projectId,
        assignee_id: undefined,
      });
      expect(mockTaskRepo.save).toHaveBeenCalledWith(createdTask);
      expect(mockActivityLogService.log).toHaveBeenCalledWith(
        userId,
        'TASK_CREATED',
        expect.stringContaining('Created task'),
      );
      expect(result).toEqual(createdTask);
    });

    it('should throw NotFoundException if project does not exist', async () => {
      mockProjectRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.create(userId, projectId, 'Test Task'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the project', async () => {
      mockProjectRepo.findOneBy.mockResolvedValue({ ...mockProject, owner_id: otherUserId });

      await expect(
        service.create(userId, projectId, 'Test Task'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── findAll() ─────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('should return all tasks for a project after ownership check', async () => {
      mockProjectRepo.findOneBy.mockResolvedValue(mockProject);
      const tasks = [mockTask, { ...mockTask, id: 'task-uuid-2', title: 'Task 2' }];
      mockTaskRepo.find.mockResolvedValue(tasks);

      const result = await service.findAll(userId, projectId);

      expect(mockProjectRepo.findOneBy).toHaveBeenCalledWith({ id: projectId });
      expect(mockTaskRepo.find).toHaveBeenCalledWith({ where: { project_id: projectId } });
      expect(result).toEqual(tasks);
    });

    it('should throw NotFoundException if project does not exist', async () => {
      mockProjectRepo.findOneBy.mockResolvedValue(null);

      await expect(service.findAll(userId, projectId)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findOne() ─────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return a task when it exists and user owns the project', async () => {
      mockTaskRepo.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne(taskId, userId);

      expect(mockTaskRepo.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['project'],
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockTaskRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(taskId, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own the project', async () => {
      mockTaskRepo.findOne.mockResolvedValue({
        ...mockTask,
        project: { ...mockProject, owner_id: otherUserId },
      });

      await expect(service.findOne(taskId, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── update() ──────────────────────────────────────────────────────

  describe('update()', () => {
    it('should update task attributes and return the saved result', async () => {
      const existingTask = { ...mockTask };
      mockTaskRepo.findOne.mockResolvedValue(existingTask);
      const updatedTask = { ...existingTask, title: 'Updated Title' };
      mockTaskRepo.save.mockResolvedValue(updatedTask);

      const result = await service.update(taskId, userId, { title: 'Updated Title' });

      expect(mockTaskRepo.save).toHaveBeenCalled();
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockTaskRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(taskId, userId, { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── updateStatus() ───────────────────────────────────────────────

  describe('updateStatus()', () => {
    it('should allow valid transition from PENDING to IN_PROGRESS', async () => {
      const pendingTask = { ...mockTask, status: TaskStatus.PENDING };
      mockTaskRepo.findOne.mockResolvedValue(pendingTask);
      mockTaskRepo.save.mockResolvedValue({ ...pendingTask, status: TaskStatus.IN_PROGRESS });

      const result = await service.updateStatus(taskId, userId, TaskStatus.IN_PROGRESS);

      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should allow valid transition from PENDING to CANCELLED', async () => {
      const pendingTask = { ...mockTask, status: TaskStatus.PENDING };
      mockTaskRepo.findOne.mockResolvedValue(pendingTask);
      mockTaskRepo.save.mockResolvedValue({ ...pendingTask, status: TaskStatus.CANCELLED });

      const result = await service.updateStatus(taskId, userId, TaskStatus.CANCELLED);

      expect(result.status).toBe(TaskStatus.CANCELLED);
    });

    it('should allow valid transition from IN_PROGRESS to COMPLETED', async () => {
      const inProgressTask = { ...mockTask, status: TaskStatus.IN_PROGRESS };
      mockTaskRepo.findOne.mockResolvedValue(inProgressTask);
      mockTaskRepo.save.mockResolvedValue({ ...inProgressTask, status: TaskStatus.COMPLETED });

      const result = await service.updateStatus(taskId, userId, TaskStatus.COMPLETED);

      expect(result.status).toBe(TaskStatus.COMPLETED);
    });

    it('should reject invalid transition from PENDING to COMPLETED', async () => {
      const pendingTask = { ...mockTask, status: TaskStatus.PENDING };
      mockTaskRepo.findOne.mockResolvedValue(pendingTask);

      await expect(
        service.updateStatus(taskId, userId, TaskStatus.COMPLETED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject any transition from COMPLETED (terminal state)', async () => {
      const completedTask = { ...mockTask, status: TaskStatus.COMPLETED };
      mockTaskRepo.findOne.mockResolvedValue(completedTask);

      await expect(
        service.updateStatus(taskId, userId, TaskStatus.PENDING),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject any transition from CANCELLED (terminal state)', async () => {
      const cancelledTask = { ...mockTask, status: TaskStatus.CANCELLED };
      mockTaskRepo.findOne.mockResolvedValue(cancelledTask);

      await expect(
        service.updateStatus(taskId, userId, TaskStatus.IN_PROGRESS),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── remove() ──────────────────────────────────────────────────────

  describe('remove()', () => {
    it('should remove the task and return success message', async () => {
      mockTaskRepo.findOne.mockResolvedValue(mockTask);
      mockTaskRepo.remove.mockResolvedValue(mockTask);

      const result = await service.remove(taskId, userId);

      expect(mockTaskRepo.remove).toHaveBeenCalledWith(mockTask);
      expect(result).toEqual({ message: 'Deleted' });
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockTaskRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(taskId, userId)).rejects.toThrow(NotFoundException);
    });
  });
});
