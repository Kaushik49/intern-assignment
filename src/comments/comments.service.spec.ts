import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { Task } from '../tasks/task.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';

describe('CommentsService', () => {
  let service: CommentsService;
  let mockCommentRepo: Record<string, jest.Mock>;
  let mockTaskRepo: Record<string, jest.Mock>;
  let mockActivityLogService: Record<string, jest.Mock>;

  const userId = 'user-uuid-1';
  const otherUserId = 'user-uuid-2';
  const taskId = 'task-uuid-1';
  const commentId = 'comment-uuid-1';

  const mockTask: Partial<Task> = {
    id: taskId,
    title: 'Test Task',
  };

  const mockComment: Partial<Comment> = {
    id: commentId,
    content: 'Test comment',
    taskId,
    authorId: userId,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    mockCommentRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    mockTaskRepo = {
      findOne: jest.fn(),
    };

    mockActivityLogService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(Comment), useValue: mockCommentRepo },
        { provide: getRepositoryToken(Task), useValue: mockTaskRepo },
        { provide: ActivityLogService, useValue: mockActivityLogService },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create() ──────────────────────────────────────────────────────

  describe('create()', () => {
    it('should create a comment and log the activity', async () => {
      mockTaskRepo.findOne.mockResolvedValue(mockTask);
      const created = { ...mockComment };
      mockCommentRepo.create.mockReturnValue(created);
      mockCommentRepo.save.mockResolvedValue(created);

      const result = await service.create(userId, taskId, 'Test comment');

      expect(mockTaskRepo.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
      expect(mockCommentRepo.create).toHaveBeenCalledWith({
        content: 'Test comment',
        taskId,
        authorId: userId,
      });
      expect(mockCommentRepo.save).toHaveBeenCalledWith(created);
      expect(mockActivityLogService.log).toHaveBeenCalledWith(
        userId,
        'COMMENT_CREATED',
        expect.stringContaining(taskId),
      );
      expect(result).toEqual(created);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockTaskRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create(userId, taskId, 'Test comment'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findAllByTask() ──────────────────────────────────────────────

  describe('findAllByTask()', () => {
    it('should return comments for a task ordered by createdAt DESC', async () => {
      const comments = [
        { ...mockComment, id: 'c2', createdAt: new Date('2025-01-02') },
        { ...mockComment, id: 'c1', createdAt: new Date('2025-01-01') },
      ];
      mockCommentRepo.find.mockResolvedValue(comments);

      const result = await service.findAllByTask(taskId);

      expect(mockCommentRepo.find).toHaveBeenCalledWith({
        where: { taskId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(comments);
      expect(result).toHaveLength(2);
    });

    it('should return an empty array when no comments exist', async () => {
      mockCommentRepo.find.mockResolvedValue([]);

      const result = await service.findAllByTask(taskId);

      expect(result).toEqual([]);
    });
  });

  // ─── findOne() ─────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return a comment when it exists', async () => {
      mockCommentRepo.findOne.mockResolvedValue(mockComment);

      const result = await service.findOne(commentId);

      expect(mockCommentRepo.findOne).toHaveBeenCalledWith({ where: { id: commentId } });
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException when comment does not exist', async () => {
      mockCommentRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(commentId)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update() ──────────────────────────────────────────────────────

  describe('update()', () => {
    it('should update a comment when the author makes the request', async () => {
      const existing = { ...mockComment, authorId: userId };
      mockCommentRepo.findOne.mockResolvedValue(existing);
      const updated = { ...existing, content: 'Updated content' };
      mockCommentRepo.save.mockResolvedValue(updated);

      const result = await service.update(commentId, userId, 'Updated content');

      expect(mockCommentRepo.save).toHaveBeenCalled();
      expect(mockActivityLogService.log).toHaveBeenCalledWith(
        userId,
        'COMMENT_UPDATED',
        expect.stringContaining(commentId),
      );
      expect(result).toEqual(updated);
    });

    it('should throw ForbiddenException when a non-author tries to update', async () => {
      mockCommentRepo.findOne.mockResolvedValue({ ...mockComment, authorId: userId });

      await expect(
        service.update(commentId, otherUserId, 'Hacked!'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when comment does not exist', async () => {
      mockCommentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(commentId, userId, 'Updated'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove() ──────────────────────────────────────────────────────

  describe('remove()', () => {
    it('should remove a comment when the author makes the request', async () => {
      const existing = { ...mockComment, authorId: userId };
      mockCommentRepo.findOne.mockResolvedValue(existing);
      mockCommentRepo.remove.mockResolvedValue(existing);

      await service.remove(commentId, userId);

      expect(mockCommentRepo.remove).toHaveBeenCalledWith(existing);
      expect(mockActivityLogService.log).toHaveBeenCalledWith(
        userId,
        'COMMENT_DELETED',
        expect.stringContaining(commentId),
      );
    });

    it('should throw ForbiddenException when a non-author tries to delete', async () => {
      mockCommentRepo.findOne.mockResolvedValue({ ...mockComment, authorId: userId });

      await expect(
        service.remove(commentId, otherUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when comment does not exist', async () => {
      mockCommentRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(commentId, userId)).rejects.toThrow(NotFoundException);
    });
  });
});
