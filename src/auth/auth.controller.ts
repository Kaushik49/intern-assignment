import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './gaurds/local-auth.guard';
import { JwtAuthGuard } from './gaurds/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  // constructor for the auth controller
  constructor(private authService: AuthService) { } // inject the auth service to the auth controller

  // register a new user
  @Post('register')
  // to validate the register endpoint
  async register(@Body() registerDto: RegisterDto) {
    // return the user without the password hash
    return this.authService.register(registerDto);
  }

  // ... keep your @Post('register') method here ...

  // local guards used from local-auth.gauard.ts  garuda
  // it helps to validate the username and password 
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // jwt auth garuds imported from jwt-auth.guard.ts 
  // it helps to validate the jwt token 
  // and get the user profile 
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
