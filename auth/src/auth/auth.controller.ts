import { Controller, Post, Body,Get,UseGuards,Request, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator'; 
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

   @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

@Get('solo-admin') //EJEMPLO CAMBIAR DESPUUUUUES Y AGREGAR OTROS ROLES
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') 
getAdminThing() {
return 'Solo admins pueden ver esto';
}

}


