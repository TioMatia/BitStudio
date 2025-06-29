import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from '../entities/inventory.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { HttpModule } from '@nestjs/axios';
import { Category } from 'src/entities/category.entity';

@Module({
imports: [TypeOrmModule.forFeature([Inventory,Category]),HttpModule],
providers: [InventoryService],
controllers: [InventoryController],
})
export class InventoryModule {}