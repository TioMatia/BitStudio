import { Controller, Post, Get, Param, Body, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';

interface UpdateStockDto {
  items: {
    inventoryId: number;
    quantity: number;
  }[];
}

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() dto: CreateInventoryDto) {
    return this.inventoryService.create(dto);
  }

  @Get('store/:storeId')
  getByStore(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.inventoryService.findByStore(storeId);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  @Patch('decrease-stock')
  async decreaseStock(@Body() dto: UpdateStockDto) {
  return this.inventoryService.decreaseStock(dto.items);
  }
  
  @Patch(':id')
  update(@Param('id') id: number, @Body() body: Partial<CreateInventoryDto>) {
  return this.inventoryService.update(id, body);
  }

  

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.remove(id);
  }
}
