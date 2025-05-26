import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class PaymentService {
private mercadopago = new MercadoPagoConfig({
accessToken: process.env.MP_ACCESS_TOKEN!,
});

async createPreference(data: any) {
if (!data?.items || !Array.isArray(data.items)) {
throw new Error('Invalid payload: items must be an array');
}
const preference = new Preference(this.mercadopago);
const successUrl = process.env.SUCCESS_URL;
const failureUrl = process.env.FAILURE_URL;
const pendingUrl = process.env.PENDING_URL;

if (!successUrl || !failureUrl || !pendingUrl) {
throw new Error("❌ Faltan URLs de back_urls en variables de entorno");
}
const result = await preference.create({
  body: {
    items: data.items.map((item: any) => ({
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: 'CLP',
    })),
    back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl
        },
    auto_return: 'approved',
  },
});

return { init_point: result.init_point };
}
}