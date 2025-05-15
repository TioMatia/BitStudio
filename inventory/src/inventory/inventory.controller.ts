import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';

@Controller('inventory')
export class InventoryController {
constructor(private readonly inventoryService: InventoryService) {}

@Post()
create(@Body() dto: CreateInventoryDto) {
return this.inventoryService.create(dto);
}

@Get('store/:storeId')
getByStore(@Param('storeId') storeId: number) {
return this.inventoryService.findByStore(storeId);
}

@Get(':id')
getOne(@Param('id') id: number) {
return this.inventoryService.findOne(id);
}
}