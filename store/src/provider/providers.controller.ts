// src/providers/providers.controller.ts

import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Controller('stores/:storeId/providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  findAll(@Param('storeId') storeId: string) {
    return this.providersService.findAll(+storeId);
  }

  @Post()
  create(@Param('storeId') storeId: string, @Body() body: CreateProviderDto) {
    return this.providersService.create(+storeId, body);
  }

  @Put(':id')
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() body: UpdateProviderDto,
  ) {
    return this.providersService.update(+storeId, +id, body);
  }

  @Delete(':id')
  delete(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.providersService.delete(+storeId, +id);
  }
}
