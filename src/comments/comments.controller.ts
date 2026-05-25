import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.guard';

@ApiTags('Comments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post('tasks/:taskId/comments')
    @ApiOperation({ summary: 'Create a comment on a specific task' })
    async create(@Request() req, @Param('taskId') taskId: string, @Body() dto: CreateCommentDto) {
        return this.commentsService.create(req.user.id, taskId, dto.content);
    }

    @Get('tasks/:taskId/comments')
    @ApiOperation({ summary: 'List all comments for a task sorted chronologically descending' })
    async findAll(@Param('taskId') taskId: string) {
        return this.commentsService.findAllByTask(taskId);
    }

    @Patch('comments/:id')
    @ApiOperation({ summary: 'Update an existing comment (Author Only)' })
    async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateCommentDto) {
        return this.commentsService.update(id, req.user.id, dto.content);
    }

    @Delete('comments/:id')
    @ApiOperation({ summary: 'Delete a comment (Author Only)' })
    async remove(@Request() req, @Param('id') id: string) {
        return this.commentsService.remove(id, req.user.id);
    }
}