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
        const stockItems = dto.items.map(item => ({
            inventoryId: item.inventoryId,
            quantity: item.quantity,
        }));


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


        const order = this.orderRepository.create({
            ...dto,
            orderNumber: this.generateOrderNumber(),
        });

        await this.orderRepository.save(order);
        const storeId = order.storeId;
        
        try {
        await firstValueFrom(
            this.httpService.patch(
            `http://store_service:3000/stores/${storeId}/increment-sales`
            )
        );
        } catch (err) {
        console.error('❌ Error al incrementar ventas en store_service:', err.message);
        }

        return order;
    }

    async findByStore(storeId: number) {
    return this.orderRepository.find({
        where: { storeId },
        order: { createdAt: 'DESC' }
    });
    }

    async findByStorePaginated(options: {
        storeId: number;
        page: number;
        limit: number;
        startDate?: string;
        endDate?: string;
        }) {
        const { storeId, page, limit, startDate, endDate } = options;

        const query = this.orderRepository
            .createQueryBuilder('order')
            .where('order.storeId = :storeId', { storeId });

        if (startDate) query.andWhere('order.createdAt >= :startDate', { startDate });
        if (endDate) query.andWhere('order.createdAt <= :endDate', { endDate });

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

    const validStatuses = [
    'pendiente',
    'Disponible para retiro',
    'Disponible para delivery',
    'Entregado'
    ];   

     if (!validStatuses.includes(newStatus)) {
            throw new BadRequestException('Estado inválido');
        }


    const puedeCambiar =
    (order.status === 'pendiente' &&
        (newStatus === 'Disponible para retiro' || newStatus === 'Disponible para delivery')) ||

    ((order.status === 'Disponible para retiro' || order.status === 'Disponible para delivery') &&
        (newStatus === 'pendiente' || newStatus === 'Entregado'));


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

    async findByUser(
    userId: number,
    startDate?: string,
    endDate?: string,
    sortKey: string = 'createdAt',
    sortDir: 'ASC' | 'DESC' = 'DESC',
    page: number = 1,
    limit: number = 10,
    ) {
    const query = this.orderRepository
        .createQueryBuilder('order')
        .where('order.userId = :userId', { userId });

    if (startDate) query.andWhere('order.createdAt >= :startDate', { startDate });
    if (endDate) query.andWhere('order.createdAt <= :endDate', { endDate });

    const validSortKeys = ['createdAt', 'total', 'status'];
    const finalSortKey = validSortKeys.includes(sortKey) ? sortKey : 'createdAt';
    const finalSortDir = sortDir === 'ASC' ? 'ASC' : 'DESC';

    query.orderBy(`order.${finalSortKey}`, finalSortDir);

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

    async markAsRated(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Orden no encontrada');

    order.rated = true;
    return this.orderRepository.save(order);
    }

    async rateOrder(orderId: number, rating: number, comment: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new Error('Orden no encontrada');

    order.rating = rating;
    order.comment = comment;
    order.rated = true;

    await this.orderRepository.save(order);

    const storeId = order.storeId;

    
    try {
        await firstValueFrom(
        this.httpService.patch(`http://store_service:3000/stores/${storeId}/rating`, {
            rating, 
        }),
        );
    } catch (error) {
        console.error('Error notificando a store-service para actualizar rating:', error.message);
    }

    return order;
    }



    
}