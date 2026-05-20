// local gaurd is a guard that is used to validate the username and password 
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


// local guards used from local-auth.gauard.ts  garuda
// it helps to validate the username and password 
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') { }
