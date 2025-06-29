import { Controller, Get, Param } from '@nestjs/common';
import { ProvidersService } from './providers.service';

@Controller('providers')
export class SingleProviderController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.providersService.findById(+id);
  }
}