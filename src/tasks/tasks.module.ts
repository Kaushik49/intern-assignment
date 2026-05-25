import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), ActivityLogModule],
  providers: [TasksService],
  controllers: [TasksController]
})
export class TasksModule { }
