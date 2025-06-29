
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '../entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providersRepo: Repository<Provider>,
  ) {}

  async findAll(storeId: number): Promise<Provider[]> {
    return this.providersRepo.find({ where: { storeId } });
  }

async create(storeId: number, data: CreateProviderDto): Promise<Provider> {
  const provider = this.providersRepo.create({ ...data, storeId });
  return this.providersRepo.save(provider);
}



  async update(storeId: number, id: number, data: UpdateProviderDto): Promise<Provider> {
    const provider = await this.providersRepo.findOne({ where: { id, storeId } });
    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    Object.assign(provider, data);
    return this.providersRepo.save(provider);
  }

  async delete(storeId: number, id: number): Promise<void> {
    const result = await this.providersRepo.delete({ id, storeId });
    if (result.affected === 0) throw new NotFoundException('Proveedor no encontrado');
  }

  async findById(id: number) {
  const provider = await this.providersRepo.findOne({ where: { id } });
  if (!provider) {
    throw new NotFoundException('Proveedor no encontrado');
  }
  return provider;
}
}
