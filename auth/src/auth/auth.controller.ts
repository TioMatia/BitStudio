import { Controller, Post, Body,Get,UseGuards,Request, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

   @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }


}


