import { Controller, Post, Body, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
  return this.usersService.findOne(+id);
  }

  @Patch(':id/mercadopago')
  async connectMercadoPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { accessToken: string; mpUserId: string },
  ) {
    return this.usersService.connectMercadoPago(id, body.accessToken, body.mpUserId);
  }

}
