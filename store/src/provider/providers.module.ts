// src/providers/providers.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from '../entities/provider.entity';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { SingleProviderController } from './single-provider.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Provider])],
  providers: [ProvidersService],
  controllers: [ProvidersController,SingleProviderController ],
})
export class ProvidersModule {}
