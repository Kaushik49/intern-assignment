import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';


@Module({
  // imports the user entity to the users module
  imports: [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule], // exports the type orm module
})
export class UsersModule {} // exports the users module
