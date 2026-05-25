import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { Task } from '../tasks/task.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment) private commentRepo: Repository<Comment>,
        @InjectRepository(Task) private taskRepo: Repository<Task>,
        private activityLogService: ActivityLogService,
    ) { }

    async create(userId: string, taskId: string, content: string): Promise<Comment> {
        const task = await this.taskRepo.findOne({ where: { id: taskId } });
        if (!task) throw new NotFoundException('Task not found');

        const comment = this.commentRepo.create({ content, taskId, authorId: userId });
        const savedComment = await this.commentRepo.save(comment);

        await this.activityLogService.log(userId, 'COMMENT_CREATED', `Added comment to task ${taskId}`);
        return savedComment;
    }

    async findAllByTask(taskId: string): Promise<Comment[]> {
        return this.commentRepo.find({
            where: { taskId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(commentId: string): Promise<Comment> {
        const comment = await this.commentRepo.findOne({ where: { id: commentId } });
        if (!comment) throw new NotFoundException('Comment not found');
        return comment;
    }

    async update(commentId: string, userId: string, content: string): Promise<Comment> {
        const comment = await this.findOne(commentId);
        if (comment.authorId !== userId) throw new ForbiddenException('Only the author can edit this comment');

        comment.content = content;
        const updatedComment = await this.commentRepo.save(comment);

        await this.activityLogService.log(userId, 'COMMENT_UPDATED', `Updated comment ${commentId}`);
        return updatedComment;
    }

    async remove(commentId: string, userId: string): Promise<void> {
        const comment = await this.findOne(commentId);
        if (comment.authorId !== userId) throw new ForbiddenException('Only the author can delete this comment');

        await this.commentRepo.remove(comment);
        await this.activityLogService.log(userId, 'COMMENT_DELETED', `Deleted comment ${commentId}`);
    }
}