import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
constructor(private readonly paymentService: PaymentService) {}

@Post('create')
async createPreference(@Body() body: any) {
return this.paymentService.createPreference(body);
}
}