import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentService {
constructor(
@InjectRepository(User)
private readonly userRepository: Repository<User>,
) {}

private mercadopago = new MercadoPagoConfig({
accessToken: process.env.MP_ACCESS_TOKEN!,
});

async createPreference(data: any, userId: number) {
if (!data?.items || !Array.isArray(data.items)) {
throw new Error('Invalid payload: items must be an array');
}
const preference = new Preference(this.mercadopago);
const successUrl = process.env.SUCCESS_URL;
const failureUrl = process.env.FAILURE_URL;
const pendingUrl = process.env.PENDING_URL;

if (!successUrl || !failureUrl || !pendingUrl) {
  throw new Error('❌ Faltan URLs de back_urls en variables de entorno');
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
      pending: pendingUrl,
    },
    auto_return: 'approved',
  },
});

return { init_point: result.init_point };
}

async handleOAuth(code: string, userId: number): Promise<any> {
const clientId = process.env.MP_CLIENT_ID!;
const clientSecret = process.env.MP_CLIENT_SECRET!;
const redirectUri = process.env.MP_REDIRECT_URI!;
try {
  const response = await axios.post(
    'https://api.mercadopago.com/oauth/token',
    {
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const accessToken = response.data.access_token;
  const refreshToken = response.data.refresh_token;
  const mpUserId = response.data.user_id;

  console.log('✅ Access Token:', accessToken);
  console.log('✅ Refresh Token:', refreshToken);
  console.log('✅ MP User ID:', mpUserId);

  // Simulación: Obtener el usuario actualmente autenticado
  // Debes adaptar esto a tu sistema de autenticación real
  
  const user = await this.userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  user.mpAccessToken = accessToken;
  user.mpUserId = mpUserId;
  await this.userRepository.save(user);

  return {
    message: 'Cuenta de Mercado Pago conectada correctamente',
  };
} catch (error: any) {
  console.error('❌ Error al intercambiar código por token:');
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  } else {
    console.error(error.message);
  }
  throw new Error('Error al conectar con Mercado Pago');
}
}
}