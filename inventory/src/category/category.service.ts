import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  findAll(): Promise<Category[]> {
    return this.categoryRepo.find();
  }

  findByStore(storeId: number): Promise<Category[]> {
    return this.categoryRepo.find({ where: { storeId } });
  }

  async create(name: string, storeId: number): Promise<Category> {
    const category = this.categoryRepo.create({ name, storeId });
    return this.categoryRepo.save(category);
  }

  async update(id: number, name: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    category.name = name;
    return this.categoryRepo.save(category);
  }

  async remove(id: number): Promise<void> {
    const result = await this.categoryRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Categoría no encontrada');
    }
  }
}