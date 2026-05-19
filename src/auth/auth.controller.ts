import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  // constructor for the auth controller
  constructor(private authService: AuthService) {} // inject the auth service to the auth controller

  // register a new user
  @Post('register')
  // to validate the register endpoint
  async register(@Body() registerDto: RegisterDto) {
    // return the user without the password hash
    return this.authService.register(registerDto);
  }
}
