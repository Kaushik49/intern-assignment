import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


// custom class name JWT auth gaurd from Auth Guard library from passprt nest js
// It is used to validate the jwt token 
// and get the user profile 
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }
