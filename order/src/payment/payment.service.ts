import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

const MP_CLIENT_ID = process.env.MP_CLIENT_ID;
const MP_CLIENT_SECRET = process.env.MP_CLIENT_SECRET;
const REDIRECT_URI = process.env.MP_REDIRECT_URI;

@Injectable()
export class PaymentService {
  constructor(
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,
  ) {}

private mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

  async createPreference(data: any) {
    const { items, sellerId } = data;
    console.log("Items recibidos:", items);
    if (!items || !Array.isArray(items)) {
      throw new Error('Invalid payload: items must be an array');
    }

    if (!sellerId) {
      throw new Error('Missing seller ID');
    }

    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth_service:3000';

    // Obtener el vendedor desde el microservicio auth
    const response = await axios.get(`${AUTH_SERVICE_URL}/users/${sellerId}`);
    const seller = response.data;

    if (!seller || !seller.mpAccessToken) {
      throw new Error('Vendedor no tiene cuenta de Mercado Pago conectada');
    }

    // Crear preferencia con el access token del vendedor
    const mp = new MercadoPagoConfig({
      accessToken: seller.mpAccessToken,
    });

    const preference = new Preference(mp);

    const successUrl = process.env.SUCCESS_URL;
    const failureUrl = process.env.FAILURE_URL;
    const pendingUrl = process.env.PENDING_URL;

    const result = await preference.create({
      body: {
        items: data.items.map((item: any) => ({
          id: item.id?.toString() ||  uuidv4(),
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
    console.log('Preferencia creada:', result);
    console.log('AccessToken:', process.env.MP_ACCESS_TOKEN);
    console.log('Seller ID:', sellerId);

    return { init_point: result.init_point };
  }


async handleOAuth(code: string, userId: string) {
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
      }
    );

    const accessToken = response.data.access_token;
    const mpUserId = response.data.user_id;

    // Buscar y actualizar el usuario
    const user = await this.userRepository.findOne({
  where: { id: Number(userId) }, 
});

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.mpAccessToken = accessToken;
    user.mpUserId = mpUserId;

    await this.userRepository.save(user);

    return {
      message: 'Cuenta de Mercado Pago conectada correctamente y guardada',
      accessToken,
      userId: mpUserId,
    };
  } catch (error: any) {
    console.error('Error al intercambiar código por token:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    throw new Error('Error al conectar con Mercado Pago');
  }
 }

   async exchangeCodeForAccessToken(code: string) {
    const response = await axios.post('https://api.mercadopago.com/oauth/token', {
      grant_type: 'authorization_code',
      client_id: MP_CLIENT_ID,
      client_secret: MP_CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data; 
  }

  async notifyAuthService(userId: number, accessToken: string, mpUserId: string) {
  const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth_service:3000'; 

  await axios.patch(`${AUTH_SERVICE_URL}/users/${userId}/mercadopago`, {
    accessToken,
    mpUserId,
  });
}
}