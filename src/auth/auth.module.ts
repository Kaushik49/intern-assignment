import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';


@Module({
  imports: [UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // inject the config service to the jwt module
      useFactory: (configService: ConfigService) => ({
        // it basically tells the strategy from where to extract the JWT token from the incoming request
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') as any },
      }),
    }),
  ], // imports the users module to the auth module
  providers: [AuthService, LocalStrategy, JwtStrategy], // providers for the auth module
  controllers: [AuthController] // controllers for the auth module
})
export class AuthModule { }
