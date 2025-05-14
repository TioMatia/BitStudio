import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    console.log('Encontrado:', user);
    console.log('Password plano:', loginDto.password);
    console.log('Password hash:', user?.password);  
    if (user && await bcrypt.compare(loginDto.password, user.password)) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

   async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);
    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role, 
        };

        return {
        access_token: this.jwtService.sign(payload),
        user: {
        id: user.id,
        email: user.email,
        role: user.role, 
        }
        };
  }

  async register(createUserDto: CreateUserDto) {
      const existing = await this.usersService.findByEmail(createUserDto.email);
      if (existing) {
        throw new BadRequestException('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = await this.usersService.create({
        ...createUserDto,
        password: hashedPassword,
      });

      return {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      };
  }
  
}
