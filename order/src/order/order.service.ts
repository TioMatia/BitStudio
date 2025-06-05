import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

    async updateStatus(id: number, newStatus: string): Promise<Order> {
        const order = await this.orderRepository.findOne({ where: { id } });

        if (!order) {
            throw new NotFoundException('Orden no encontrada');
        }

        const validStatuses = ['pendiente', 'Disponible para retiro', 'Disponible para delivery'];
        if (!validStatuses.includes(newStatus)) {
            throw new BadRequestException('Estado inválido');
        }

        // Cambios permitidos
        const puedeCambiar =
            (order.status === 'pendiente' &&
            (newStatus === 'Disponible para retiro' || newStatus === 'Disponible para delivery')) ||
            ((order.status === 'Disponible para retiro' || order.status === 'Disponible para delivery') &&
            newStatus === 'pendiente');

        if (!puedeCambiar) {
            throw new BadRequestException('Cambio de estado no permitido');
        }

        order.status = newStatus;
        return this.orderRepository.save(order);
        }
    
}