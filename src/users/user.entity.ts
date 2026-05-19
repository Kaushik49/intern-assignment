import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

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
}
