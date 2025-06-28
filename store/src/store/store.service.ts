import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from '../entities/store.entity';
import { Repository } from 'typeorm';
import { CreateStoreDto } from './dto/create-store.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class StoreService {
constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly httpService: HttpService
    ) {}

    async create(dto: CreateStoreDto): Promise<Store> {
        const store = this.storeRepository.create(dto);
        return this.storeRepository.save(store);
    }

    async findAll(): Promise<Store[]> {
        return this.storeRepository.find({
            order: {
            totalSales: 'ASC', 
            },
        });
    }

    async findOne(id: number): Promise<any> {
    console.log('Buscando tienda con id:', id);
    const store = await this.storeRepository.findOne({ where: { id } });
    if (!store) throw new NotFoundException('Store not found');

    try {
    const response = await lastValueFrom(
    this.httpService.get(`${process.env.USER_SERVICE_URL}/users/${store.userId}`)
    );
    const user = response.data;
    return {
        ...store,
        owner: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            mpAccessToken: user.mpAccessToken
        },
    };
        } catch (err) {
        console.error('Error fetching user info:', err.message);
        return {
        ...store,
        owner: null,
        };
        }
}

    async findByUserId(userId: number): Promise<any> {
        const store = await this.storeRepository.findOne({ where: { userId } });
        if (!store) return null;

        try {
            const response = await lastValueFrom(this.httpService.get(`${process.env.USER_SERVICE_URL}/users/${userId}`));
            const user = response.data;
            return {
                ...store,
                owner: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    mpAccessToken: user.mpAccessToken,
                },
                    };
        } catch (err) {
            console.error('Error fetching user info:', err.message);
            return {
                ...store,
                owner: null,
            };
        }
    }

    async updateRating(storeId: number, newRating: number): Promise<Store> {
        const store = await this.storeRepository.findOne({ where: { id: storeId } });
        if (!store) throw new NotFoundException('Tienda no encontrada');
        store.score = (store.score || 0) + newRating;
        store.numRatings = (store.numRatings || 0) + 1;
        store.rating = store.score / store.numRatings;
        return this.storeRepository.save(store);
        }

    async incrementSales(storeId: number): Promise<Store> {
        const store = await this.storeRepository.findOne({ where: { id: storeId } });
        if (!store) throw new NotFoundException('Tienda no encontrada');

        store.totalSales = (store.totalSales || 0) + 1;
        return this.storeRepository.save(store);
    }
}