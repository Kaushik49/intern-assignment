import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { WorkspaceMember } from './workspace-member.entity';

// database schema for workspace
@Entity('workspaces')
export class Workspace {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => WorkspaceMember, (member) => member.workspace, { cascade: true })
    members: WorkspaceMember[];
}
