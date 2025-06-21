import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from '../dto/create-order.dto';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}
    @Get()
    getAllOrders() {
    return this.orderService.findAll();
    }

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
    
    @Patch(':id/status')
        async updateStatus(
        @Param('id') id: number,
        @Body('status') status: string,
        ) {
        return this.orderService.updateStatus(id, status);
        }

}