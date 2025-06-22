import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { randomBytes } from 'crypto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) {}

    async createOrder(dto: CreateOrderDto): Promise<Order> {
        // 1. Preparar items para actualizar stock
        // Asumo que dto.items tiene algo así:
        // [{ inventoryId: number, quantity: number, ... }, ...]
        const stockItems = dto.items.map(item => ({
            inventoryId: item.inventoryId,
            quantity: item.quantity,
        }));

        // 2. Llamar al microservicio inventory para decrementar stock
        try {
            await firstValueFrom(
                this.httpService.patch(
                    'http://inventory_service:3000/inventory/decrease-stock',
                    { items: stockItems }
                )
            );
        } catch (error) {
            throw new InternalServerErrorException('No se pudo actualizar el stock: ' + error.message);
        }

        // 3. Crear la orden solo si la actualización del stock fue exitosa
        const order = this.orderRepository.create({
            ...dto,
            orderNumber: this.generateOrderNumber(),
        });

        await this.orderRepository.save(order);

        return order;
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

    async findAll(): Promise<Order[]> {
        return this.orderRepository.find({
            order: { createdAt: 'DESC' },
        });
     }

     async findPaginated(options: {
            page: number;
            limit: number;
            storeId?: number;
            startDate?: string;
            endDate?: string;
            }) {
            const { page, limit, storeId, startDate, endDate } = options;

            const query = this.orderRepository.createQueryBuilder('order');

            if (storeId) {
                query.andWhere('order.storeId = :storeId', { storeId });
            }

            if (startDate) {
                query.andWhere('order.createdAt >= :startDate', { startDate });
            }

            if (endDate) {
                query.andWhere('order.createdAt <= :endDate', { endDate });
            }

            query.orderBy('order.createdAt', 'DESC');

            const [data, total] = await query
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();

            return {
                data,
                total,
                page,
                pageCount: Math.ceil(total / limit),
            };
         }

    async getResumenPorCliente(storeId?: number, startDate?: string, endDate?: string) {
    const query = this.orderRepository
        .createQueryBuilder("order")
        .select("order.userName", "nombre")
        .addSelect("SUM(order.total)", "totalGastado")
        .addSelect("COUNT(order.id)", "cantidadOrdenes")
        .groupBy("order.userName");

    if (storeId) {
        query.andWhere("order.storeId = :storeId", { storeId });
    }

    if (startDate) {
        query.andWhere("order.createdAt >= :startDate", { startDate });
    }

    if (endDate) {
        query.andWhere("order.createdAt <= :endDate", { endDate });
    }

    return await query.getRawMany();
    }

    async getResumenGeneral(storeId?: number, startDate?: string, endDate?: string) {
        const query = this.orderRepository
            .createQueryBuilder("order")
            .select("SUM(order.total)", "totalVentas")
            .addSelect("COUNT(order.id)", "cantidadOrdenes");

        if (storeId) {
            query.andWhere("order.storeId = :storeId", { storeId });
        }

        if (startDate) {
            query.andWhere("order.createdAt >= :startDate", { startDate });
        }

        if (endDate) {
            query.andWhere("order.createdAt <= :endDate", { endDate });
        }

        const result = await query.getRawOne();

        const totalVentas = parseFloat(result.totalVentas || 0);
        const cantidadOrdenes = parseInt(result.cantidadOrdenes || 0);
        const promedio = cantidadOrdenes > 0 ? totalVentas / cantidadOrdenes : 0;

        return {
            totalVentas,
            cantidadOrdenes,
            promedio,
        };
     }

     async getVentasPorTienda(
        storeId?: number,
        startDate?: string,
        endDate?: string,
        ) {
        const query = this.orderRepository
            .createQueryBuilder('order')
            .select('order.storeId', 'storeId')
            .addSelect('SUM(order.total)', 'ventas')
            .groupBy('order.storeId');

        if (storeId) {
            query.andWhere('order.storeId = :storeId', { storeId });
        }

        if (startDate) {
            query.andWhere('order.createdAt >= :startDate', { startDate });
        }

        if (endDate) {
            query.andWhere('order.createdAt <= :endDate', { endDate });
        }

        return query.getRawMany();
        }

    async findForExport(options: {
        storeId?: number;
        startDate?: string;
        endDate?: string;
        }) {
        const { storeId, startDate, endDate } = options;

        const query = this.orderRepository.createQueryBuilder('order');

        if (storeId) {
            query.andWhere('order.storeId = :storeId', { storeId });
        }

        if (startDate) {
            query.andWhere('order.createdAt >= :startDate', { startDate });
        }

        if (endDate) {
            query.andWhere('order.createdAt <= :endDate', { endDate });
        }

        query.orderBy('order.createdAt', 'DESC');

        return query.getMany();
    }

    
}