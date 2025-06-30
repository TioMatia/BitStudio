import { Controller, Post, Body, Get, Param, Patch, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from '../dto/create-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  getPaginatedOrders(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('storeId') storeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.orderService.findPaginated({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      storeId: storeId ? parseInt(storeId) : undefined,
      startDate,
      endDate,
    });
  }

    @Get("summary-by-client")
    async getSummaryByClient(
    @Query("storeId") storeId?: number,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    ) {
    return this.orderService.getResumenPorCliente(storeId, startDate, endDate);
    }

    @Get('sales-by-store')
    getSalesByStore(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('storeId') storeId?: string,
    ) {
    return this.orderService.getVentasPorTienda(
        storeId ? parseInt(storeId) : undefined,
        startDate,
        endDate
    );
    }
    @Get("summary")
    async getResumenGeneral(
    @Query("storeId") storeId?: number,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    ) {
    return this.orderService.getResumenGeneral(storeId, startDate, endDate);
    }

    @Get('export')
    getAllForExport(
    @Query('storeId') storeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    ) {
    return this.orderService.findForExport({
        storeId: storeId ? parseInt(storeId) : undefined,
        startDate,
        endDate,
    });
    }
    
  @Get('/store/:storeId')
  getOrdersByStorePaginated(
    @Param('storeId') storeId: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.orderService.findByStorePaginated({
      storeId: +storeId,
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
  }

  @Get('user/:userId')
  async getOrdersByUser(
    @Param('userId') userId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortKey') sortKey?: string,
    @Query('sortDir') sortDir?: 'ASC' | 'DESC',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.orderService.findByUser(
      +userId,
      startDate,
      endDate,
      sortKey,
      sortDir,
      parseInt(page),
      parseInt(limit),
    );
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
    @Body() body: { status: string; comment?: string },
  ) {
    return this.orderService.updateStatus(id, body.status, body.comment);
  }

  @Patch(':id/rated')
  markOrderRated(@Param('id') id: number) {
    return this.orderService.markAsRated(+id);
  }

  @Patch(':id/rate')
  async rateOrder(
    @Param('id') id: number,
    @Body() body: { rating: number; comment: string }
  ) {
    return this.orderService.rateOrder(+id, body.rating, body.comment);
  }

}
