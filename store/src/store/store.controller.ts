import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';

@Controller('stores')
export class StoreController {
constructor(private readonly storeService: StoreService) {}

@Post()
create(@Body() dto: CreateStoreDto) {
return this.storeService.create(dto);
}

@Get()
findAll() {
return this.storeService.findAll();
}
@Get(':id')
getStoreById(@Param('id') id: number) {
return this.storeService.findOne(id);
}

@Get('user/:userId')
getStoreByUserId(@Param('userId') userId: number) {
return this.storeService.findByUserId(userId);
}

}
