import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember, WorkspaceRole } from './entities/workspace-member.entity';
import { CreateWorkspaceDto, InviteMemberDto, UpdateRoleDto } from './dto/workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private memberRepository: Repository<WorkspaceMember>,
    private dataSource: DataSource,
  ) {}

  async createWorkspace(userId: string, dto: CreateWorkspaceDto): Promise<Workspace> {
    // Use a transaction to ensure both workspace and owner membership record are created successfully
    return this.dataSource.transaction(async (manager) => {
      const workspace = manager.create(Workspace, { name: dto.name });
      const savedWorkspace = await manager.save(workspace);

      const member = manager.create(WorkspaceMember, {
        workspaceId: savedWorkspace.id,
        userId: userId,
        role: WorkspaceRole.OWNER,
      });
      await manager.save(member);

      return savedWorkspace;
    });
  }

  async inviteMember(workspaceId: string, dto: InviteMemberDto): Promise<WorkspaceMember> {
    const existing = await this.memberRepository.findOne({
      where: { workspaceId, userId: dto.userId },
    });
    if (existing) throw new ConflictException('User is already a member of this workspace');

    const newMember = this.memberRepository.create({
      workspaceId,
      userId: dto.userId,
      role: dto.role,
    });
    return this.memberRepository.save(newMember);
  }

  async updateMemberRole(workspaceId: string, memberId: string, dto: UpdateRoleDto): Promise<WorkspaceMember> {
    const member = await this.memberRepository.findOne({
      where: { workspaceId, userId: memberId },
    });
    if (!member) throw new NotFoundException('Member not found in this workspace');

    member.role = dto.role;
    return this.memberRepository.save(member);
  }

  async removeMember(workspaceId: string, memberId: string): Promise<{ message: string }> {
    const result = await this.memberRepository.delete({ workspaceId, userId: memberId });
    if (result.affected === 0) throw new NotFoundException('Member not found in this workspace');

    return { message: 'Member removed successfully' };
  }
}
