import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from '../entities/inventory.entity';
import { Repository } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>
  ) {}

  async create(dto: CreateInventoryDto): Promise<Inventory> {
    const item = this.inventoryRepo.create(dto);
    return this.inventoryRepo.save(item);
  }

  async findByStore(storeId: number): Promise<Inventory[]> {
    return this.inventoryRepo.find({
      where: { storeId },
    });
  }

  async findOne(id: number): Promise<Inventory> {
    const item = await this.inventoryRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

async update(id: number, changes: Partial<CreateInventoryDto>) {
  const item = await this.inventoryRepo.findOne({ where: { id } });
  if (!item) throw new NotFoundException('Producto no encontrado');
  Object.assign(item, changes);
  return this.inventoryRepo.save(item);
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
