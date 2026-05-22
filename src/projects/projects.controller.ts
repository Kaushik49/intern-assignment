// src/projects/projects.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsOptional } from 'class-validator';
import { ProjectsService } from './projects.service';

class CreateProjectDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
}

@UseGuards(AuthGuard('jwt'))          // 🔒 All routes require a valid JWT
@Controller('projects')
export class ProjectsController {
  constructor(private readonly svc: ProjectsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateProjectDto) {
    return this.svc.create(req.user.id, dto.name, dto.description);
  }

  @Get()
  findAll(@Request() req) {
    return this.svc.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.svc.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: Partial<CreateProjectDto>) {
    return this.svc.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.svc.remove(id, req.user.id);
  }
}