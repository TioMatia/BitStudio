import { Injectable, NotFoundException } from '@nestjs/common';
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

const item = this.inventoryRepo.create({ ...dto});
return this.inventoryRepo.save(item);
}

async findByStore(storeId: number): Promise<Inventory[]> {
return this.inventoryRepo.find({
where: { storeId },
});
}

async findOne(id: number): Promise<Inventory> {
const item = await this.inventoryRepo.findOne({ where: { id }, relations: ['store'] });
if (!item) throw new NotFoundException('Item not found');
return item;
}
}