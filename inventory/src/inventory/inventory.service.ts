import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from '../entities/inventory.entity';
import { Repository } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Category } from '../entities/category.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,

    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,

    private readonly httpService: HttpService,
  ) {}

  private async verifyProvider(providerId: number) {
    try {
      const response: AxiosResponse<any> = await lastValueFrom(
        this.httpService.get(`http://store_service:3000/providers/${providerId}`),
      );
      return response.data;
    } catch (error) {
      throw new NotFoundException('Proveedor no encontrado');
    }
  }

  private async getOrCreateCategories(names: string[]): Promise<Category[]> {
    const categories: Category[] = [];

    for (const name of names) {
      let category = await this.categoryRepo.findOne({ where: { name } });

      if (!category) {
        category = this.categoryRepo.create({ name });
        await this.categoryRepo.save(category);
      }

      categories.push(category);
    }

    return categories;
  }

  async create(dto: CreateInventoryDto): Promise<Inventory> {
    if (dto.providerId) {
      await this.verifyProvider(dto.providerId);
    }

    const { categories, categoryIds, ...rest } = dto;
    const item = this.inventoryRepo.create(rest);

    if (categories && categories.length > 0) {
      const categoryEntities = await this.getOrCreateCategories(categories);
      item.categories = categoryEntities;
    } else if (categoryIds && categoryIds.length > 0) {
      const existingCategories = await this.categoryRepo.findByIds(categoryIds);
      item.categories = existingCategories;
    }

    return this.inventoryRepo.save(item);
  }

  async update(id: number, changes: Partial<CreateInventoryDto>) {
    const item = await this.inventoryRepo.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!item) throw new NotFoundException('Producto no encontrado');

    if (changes.providerId) {
      await this.verifyProvider(changes.providerId);
    }

    const { categories, ...rest } = changes;
    Object.assign(item, rest);

    if (categories) {
      const categoryEntities = await this.getOrCreateCategories(categories);
      item.categories = categoryEntities;
    }

    return this.inventoryRepo.save(item);
  }

  async findByStore(storeId: number): Promise<any[]> {
    const items = await this.inventoryRepo.find({
      where: { storeId },
      relations: ['categories'],
    });

    const enriched = await Promise.all(
      items.map(async (item) => {
        let providerName: string | null = null;

        if (item.providerId) {
          try {
            const response = await lastValueFrom(
              this.httpService.get(`http://store_service:3000/providers/${item.providerId}`),
            );
            providerName = response.data.name;
          } catch (error) {
            providerName = null;
          }
        }

        return { ...item, providerName };
      }),
    );

    return enriched;
  }

  async findOne(id: number): Promise<Inventory> {
    const item = await this.inventoryRepo.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async remove(id: number): Promise<void> {
    const result = await this.inventoryRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Producto no encontrado');
    }
  }

  async decreaseStock(items: { inventoryId: number; quantity: number }[]) {
    for (const item of items) {
      const inventory = await this.inventoryRepo.findOneBy({ id: item.inventoryId });
      if (!inventory) throw new Error(`Producto ${item.inventoryId} no encontrado`);

      if (inventory.quantity < item.quantity)
        throw new Error(`Stock insuficiente para producto ${inventory.id}`);

      inventory.quantity -= item.quantity;
      await this.inventoryRepo.save(inventory);
    }

    return { message: 'Stock actualizado correctamente' };
  }
}
