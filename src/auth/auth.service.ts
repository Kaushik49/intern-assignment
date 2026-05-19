import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // constructor for the auth service
  constructor(
    // inject the users repository to the auth service
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // register a new user
  // takes in data structure as per registerDTO and waits for promise to resolve with password hash 
  async register(registerDto: RegisterDto): Promise<Omit<User, 'passwordHash'>> {
    // destructure the email and password from the register dto
    const { email, password } = registerDto;

    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // generate a salt for the password
    const salt = await bcrypt.genSalt();
    // hash the password with the salt
    const passwordHash = await bcrypt.hash(password, salt);
    // create a new user with the email and password hash
    const user = this.usersRepository.create({ email, passwordHash });
    await this.usersRepository.save(user);

    // destructure the password hash from the user
    // three dots are used to destructure the password hash from the user
    const { passwordHash: _, ...result } = user;
    // return the user without the password hash
    return result;
  }
}
