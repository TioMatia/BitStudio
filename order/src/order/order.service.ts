import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { CreateOrderDto } from '../dto/create-order.dto';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) {}

    async createOrder(dto: CreateOrderDto): Promise<Order> {
        const order = this.orderRepository.create(dto);
        return this.orderRepository.save(order);
    }
    async findByStore(storeId: number) {
    return this.orderRepository.find({
        where: { storeId },
        order: { createdAt: 'DESC' }
    });
    }
}