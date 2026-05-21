import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';

import { Workspace } from './workspace.entity';
import { User } from '../../users/user.entity';

// Roles a member can have inside a workspace

export enum WorkspaceRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    MEMBER = 'member',
}
@Entity('workspace_members')
@Unique(['workspaceId', 'userId']) // Prevents duplicate memberships
export class WorkspaceMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    // Foreign key stored as plain column for easy querying without a JOIN
    @Column()
    workspaceId: string;
    // Foreign key stored as plain column for easy querying without a JOIN
    @Column()
    userId: string;
    @Column({ type: 'enum', enum: WorkspaceRole, default: WorkspaceRole.MEMBER })
    role: WorkspaceRole;
    @CreateDateColumn()
    joinedAt: Date;
    // Relation to Workspace — cascades deletes so members are removed with the workspace
    @ManyToOne(() => Workspace, (workspace) => workspace.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workspaceId' })
    workspace: Workspace;
    // Relation to User — cascades deletes so memberships are removed with the user
    @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
    @JoinColumn({ name: 'userId' })
    user: User;
}
