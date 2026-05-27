import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, WorkspaceMember]), ActivityLogModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [TypeOrmModule], // Export to make repositories available to the Guard
})
export class WorkspaceModule {}
