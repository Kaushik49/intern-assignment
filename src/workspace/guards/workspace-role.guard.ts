import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceMember, WorkspaceRole } from '../entities/workspace-member.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(WorkspaceMember)
    private memberRepository: Repository<WorkspaceMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Set up by your AuthGuard
    const workspaceId = request.params.workspaceId;

    if (!user || !workspaceId) {
      throw new ForbiddenException('Missing authentication session or workspace identifier');
    }

    const membership = await this.memberRepository.findOne({
      where: { workspaceId, userId: user.id },
    });

    if (!membership || !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('You do not have the required workspace permissions');
    }

    return true;
  }
}
