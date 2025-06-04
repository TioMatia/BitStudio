import { Controller, Post, Body, Get, Query, BadRequestException, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
constructor(private readonly paymentService: PaymentService) {}

@Get('mercadopago/oauth/callback')
async handleMPCallback(
  @Query('code') code: string,
  @Query('state') state: string,
) {
  const userId = parseInt(state, 10);
  if (!userId || isNaN(userId)) {
    throw new BadRequestException('User ID inválido en state');
  }

  try {
    const mpData = await this.paymentService.exchangeCodeForAccessToken(code);
    await this.paymentService.notifyAuthService(userId, mpData.access_token, mpData.user_id);

    return { message: 'Cuenta de Mercado Pago conectada correctamente' };
  } catch (err) {
    console.error("❌ Error al conectar con Mercado Pago:", err.response?.data || err.message);
    throw new BadRequestException('Error al conectar con Mercado Pago');
  }
}

@Post('create')
async createPreference(@Body() body: any) {
return this.paymentService.createPreference(body);
}


}