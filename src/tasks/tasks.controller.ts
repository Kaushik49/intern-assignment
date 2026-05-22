// src/tasks/tasks.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { TasksService } from './tasks.service';
import { TaskStatus } from './task.entity';

class CreateTaskDto {
  @IsString()           title: string;
  @IsOptional() @IsString() description?: string;
  @IsUUID()             projectId: string;
  @IsOptional() @IsUUID() assigneeId?: string;
}

class UpdateStatusDto {
  @IsEnum(TaskStatus) status: TaskStatus;
}

@UseGuards(AuthGuard('jwt'))          // 🔒 All routes require a valid JWT
@Controller('tasks')
export class TasksController {
  constructor(private readonly svc: TasksService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateTaskDto) {
    return this.svc.create(req.user.id, dto.projectId, dto.title, dto.description, dto.assigneeId);
  }

  @Get('project/:projectId')
  findAll(@Request() req, @Param('projectId') projectId: string) {
    return this.svc.findAll(req.user.id, projectId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.svc.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() body: Partial<{ title: string; description: string }>) {
    return this.svc.update(id, req.user.id, body);
  }

  @Patch(':id/status')              // Dedicated status-transition endpoint
  updateStatus(@Request() req, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.svc.updateStatus(id, req.user.id, dto.status);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.svc.remove(id, req.user.id);
  }
}