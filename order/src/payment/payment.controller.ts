import { Controller, Post, Body, Get, Query, UseGuards} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../decorators/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('payment')
export class PaymentController {
    
constructor(private readonly paymentService: PaymentService) {}


@Get('mercadopago/oauth/callback')
async handleOAuthCallback(
  @Query('code') code: string,
  @Query('state') state: string
) {
  const parsed = JSON.parse(state);
  const userId = parseInt(parsed.userId);
  return this.paymentService.handleOAuth(code, userId);
}

@UseGuards(JwtAuthGuard)
@Post('create')
async createPreference(@Body() body: any, @CurrentUser() user: any) {
return this.paymentService.createPreference(body, user.id);
}

}
