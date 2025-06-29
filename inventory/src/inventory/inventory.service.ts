import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from '../entities/inventory.entity';
import { Repository } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    private readonly httpService: HttpService
  ) {}

  private async verifyProvider(providerId: number) {
    try {
      const response: AxiosResponse<any> = await lastValueFrom(
        this.httpService.get(`http://store_service:3000/providers/${providerId}`)
      );
      return response.data;
    } catch (error) {
      throw new NotFoundException('Proveedor no encontrado');
    }
  }

  async create(dto: CreateInventoryDto): Promise<Inventory> {
    if (dto.providerId) {
      await this.verifyProvider(dto.providerId);
    }
    const item = this.inventoryRepo.create(dto);
    return this.inventoryRepo.save(item);
  }

  async remove(id: number): Promise<void> {
    const result = await this.inventoryRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Producto no encontrado');
    }
  }

async findByStore(storeId: number): Promise<any[]> {
  const items = await this.inventoryRepo.find({ where: { storeId } });


  const enriched = await Promise.all(
    items.map(async (item) => {
      let providerName: string | null = null;

      if (item.providerId) {
        try {
          const response = await lastValueFrom(
            this.httpService.get(`http://store_service:3000/providers/${item.providerId}`)
          );
          providerName = response.data.name;
        } catch (error) {
          providerName = null; 
        }
      }

      return { ...item, providerName };
    })
  );

  return enriched;
}

  async findOne(id: number): Promise<Inventory> {
    const item = await this.inventoryRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async update(id: number, changes: Partial<CreateInventoryDto>) {
    const item = await this.inventoryRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Producto no encontrado');

    if (changes.providerId) {
      await this.verifyProvider(changes.providerId);
    }

    Object.assign(item, changes);
    return this.inventoryRepo.save(item);
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
