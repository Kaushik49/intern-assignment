import { Controller, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto, InviteMemberDto, UpdateRoleDto } from './dto/workspace.dto';
import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.guard'; // Replace with your path to JWT Auth Guard
import { WorkspaceRoleGuard } from './guards/workspace-role.guard';
import { Roles } from './decorators/roles.decorator';
import { WorkspaceRole } from './entities/workspace-member.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator'; // Replace with your path to GetUser decorator

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateWorkspaceDto) {
    return this.workspaceService.createWorkspace(userId, dto);
  }

  @Post(':workspaceId/members')
  @UseGuards(WorkspaceRoleGuard)
  @Roles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  invite(@Param('workspaceId') workspaceId: string, @Body() dto: InviteMemberDto) {
    return this.workspaceService.inviteMember(workspaceId, dto);
  }

  @Patch(':workspaceId/members/:memberId')
  @UseGuards(WorkspaceRoleGuard)
  @Roles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  updateRole(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.workspaceService.updateMemberRole(workspaceId, memberId, dto);
  }

  @Delete(':workspaceId/members/:memberId')
  @UseGuards(WorkspaceRoleGuard)
  @Roles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  remove(@Param('workspaceId') workspaceId: string, @Param('memberId') memberId: string) {
    return this.workspaceService.removeMember(workspaceId, memberId);
  }
}
