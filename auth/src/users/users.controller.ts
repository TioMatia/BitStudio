import { Controller, Post, Body, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
  
  @Get()
  getPaginatedUsers(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('sortKey') sortKey?: string,
    @Query('sortDir') sortDir?: 'asc' | 'desc',
  ) {
    return this.usersService.findPaginated({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sortKey: sortKey || 'id',
      sortDir: sortDir || 'asc',
    });
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
