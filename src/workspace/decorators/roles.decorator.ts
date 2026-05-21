
import { SetMetadata } from '@nestjs/common';
import { WorkspaceRole } from '../entities/workspace-member.entity';

export const ROLES_KEY = 'workspace_roles';
export const Roles = (...roles: WorkspaceRole[]) => SetMetadata(ROLES_KEY, roles);
