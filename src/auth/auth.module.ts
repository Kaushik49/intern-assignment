import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule], // imports the users module to the auth module
  providers: [AuthService], // providers for the auth module
  controllers: [AuthController] // controllers for the auth module
})
export class AuthModule {}
