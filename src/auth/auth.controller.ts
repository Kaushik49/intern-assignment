import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './gaurds/local-auth.guard';
import { JwtAuthGuard } from './gaurds/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  // constructor for the auth controller
  constructor(private authService: AuthService) { } // inject the auth service to the auth controller

  // register a new user
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  // to validate the register endpoint
  async register(@Body() registerDto: RegisterDto) {
    // return the user without the password hash
    return this.authService.register(registerDto);
  }



  // local guards used from local-auth.gauard.ts 
  // it helps to validate the username and password 
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Successfully authenticated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Body() loginDto: LoginDto) {
    // executes the authservice login in authservice.ts
    return this.authService.login(loginDto);
  }

  // jwt auth garuds imported from jwt-auth.guard.ts 
  // it helps to validate the jwt token 
  // and get the user profile 
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    // returns the user details verifying the jwt token 
    return user;
  }
}
