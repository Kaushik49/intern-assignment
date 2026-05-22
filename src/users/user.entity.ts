import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { Project } from 'src/projects/project.entity';
import { Task } from 'src/tasks/task.entity';
// schema for users table
@Entity('users')
export class User {
  // primary key for users table
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // email for users table
  @Column({ unique: true })
  email: string;

  // password hash for users table
  @Column()
  passwordHash: string;

  // created at for users table
  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Project, (p) => p.owner)
  projects: Project[];

  @OneToMany(() => Task, (t) => t.assignee)
  tasks: Task[];
  
}
