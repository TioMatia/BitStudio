import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from '../entities/store.entity';
import { Repository } from 'typeorm';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoreService {
constructor(
@InjectRepository(Store)
private readonly storeRepository: Repository<Store>,
) {}

async create(dto: CreateStoreDto): Promise<Store> {
const store = this.storeRepository.create(dto);
return this.storeRepository.save(store);
}

async findAll(): Promise<Store[]> {
return this.storeRepository.find({
order: {
score: 'DESC', // puedes ordenar por puntaje o fecha
},
});
}
}