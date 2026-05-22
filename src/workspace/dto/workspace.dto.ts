import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { WorkspaceRole } from '../entities/workspace-member.entity';

// what type of data should be requested , type of data structure and parameters
export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class InviteMemberDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;
}

export class UpdateRoleDto {
  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;
}
