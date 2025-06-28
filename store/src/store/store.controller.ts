import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, Patch } from '@nestjs/common';
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

@Get('user/:userId')
getStoreByUserId(@Param('userId') userId: number) {
  return this.storeService.findByUserId(userId);
}

@Get(':id')
getStoreById(@Param('id') id: number) {
  return this.storeService.findOne(id);
}

@Patch(':id/rating')
async updateRating(
  @Param('id') id: number,
  @Body('rating') rating: number,
) {
  return this.storeService.updateRating(id, rating);
}
}
