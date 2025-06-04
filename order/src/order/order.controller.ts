import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from '../dto/create-order.dto';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get('/store/:storeId')
    getOrdersByStore(@Param('storeId') storeId: number) {
    return this.orderService.findByStore(storeId);
    }

    @Post()
        async create(@Body() dto: CreateOrderDto) {
        const order = await this.orderService.createOrder(dto);
        return {
            message: 'Orden creada exitosamente',
            order,
        };
    }
}