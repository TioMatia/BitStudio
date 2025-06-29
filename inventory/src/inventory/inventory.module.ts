import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from '../entities/inventory.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
imports: [TypeOrmModule.forFeature([Inventory]),HttpModule],
providers: [InventoryService],
controllers: [InventoryController],
})
export class InventoryModule {}