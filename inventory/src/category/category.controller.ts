import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from '../entities/category.entity';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get('store/:storeId')
  findByStore(@Param('storeId', ParseIntPipe) storeId: number): Promise<Category[]> {
    return this.categoryService.findByStore(storeId);
  }

  @Post()
  create(@Body('name') name: string, @Body('storeId', ParseIntPipe) storeId: number): Promise<Category> {
    return this.categoryService.create(name, storeId);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body('name') name: string): Promise<Category> {
    return this.categoryService.update(id, name);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.categoryService.remove(id);
  }
}