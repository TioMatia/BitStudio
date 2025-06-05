import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) {}

    async createOrder(dto: CreateOrderDto): Promise<Order> {
        const order = this.orderRepository.create({
        ...dto,
        orderNumber: this.generateOrderNumber(),
        });
        await this.orderRepository.save(order);
        return this.orderRepository.save(order);
    }

    async findByStore(storeId: number) {
    return this.orderRepository.find({
        where: { storeId },
        order: { createdAt: 'DESC' }
    });
    }

    private generateOrderNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = randomBytes(3).toString('hex').toUpperCase(); 
    return `ORD-${datePart}-${randomPart}`;
    }

    
}