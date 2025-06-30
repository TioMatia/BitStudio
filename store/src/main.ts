import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { StoreService } from './store/store.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  const storeService = app.get(StoreService);


  const shippingMethods: ('pickup' | 'delivery' | 'both')[] = ['pickup', 'delivery', 'both'];
  const deliveryFees = [0, 1000, 1500, 2000];
  const phoneNumbers = ['+56911111111', '+56922222222', '+56933333333', '+56944444444', '+56955555555'];
  const imageUrls = [
    'https://thefoodtech.com/wp-content/uploads/2023/10/PANADERIA-PRINCIPAL-1-828x548.jpg',
    'https://mejisa.com/wp-content/uploads/2021/11/heladeria.jpg',
    'https://mandolina.co/wp-content/uploads/2022/08/Panaderia-y-reposteria-dulce-02.png',
    'https://www.diarioestrategia.cl/images/showid/6076526',
    'https://images.mnstatic.com/6f/eb/6feb21ceb65995302a6685252a69a006.jpg',
    'https://services.meteored.com/img/article/6-pizzerias-chilenas-brillan-en-el-ranking-50-top-pizza-latinoamerica-1746285252501_512.jpg',
    'https://media.istockphoto.com/id/471997528/es/foto/diversos-tejidos-para-la-venta.jpg?s=612x612&w=0&k=20&c=xbPJcT4AYnaXEMSrtDSg0BX9JRXbbKTbnFq68JpdzZQ=',
    'https://cdn.elobservatodo.cl/sites/elobservatodo.cl/files/imagecache/opengraph/imagen_noticia/electronano_1.jpg',
    'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/35/86/56/libreria-interior-credit.jpg?w=1200&h=-1&s=1'
  ];

  const vendedores = [
    { userId: 4, name: 'Panaderia', owner: 'Pedro Vendedor', location: 'Av OHiggins #123' },
    { userId: 5, name: 'Heladeria', owner: 'María Vendedora', location: 'Balmaceda #321' },
    { userId: 6, name: 'Pasteleria', owner: 'Matias Vendedor', location: 'Gabriela Mistral #456' },
    { userId: 7, name: 'Almacen de Carolina', owner: 'Carolina Vendedora', location: 'Condell #678' },
    { userId: 8, name: 'Kiosko', owner: 'Jose Vendedor', location: 'Amunatequi #789' },
    { userId: 9, name: 'Pizzeria', owner: 'Veronica Vendedora', location: 'Villa Alemana #678' },
    { userId: 10, name: 'Tienda de telas', owner: 'Nicolas Vendedor', location: 'El Sauce #890' },
    { userId: 11, name: 'Tienda de tecnología', owner: 'Camila Vendedora', location: 'Los Clarines #789' },
    { userId: 12, name: 'Libreria', owner: 'Benjamin Vendedor', location: 'Vivar #567' },
  ];

  for (let i = 0; i < vendedores.length; i++) {
    const tienda = vendedores[i];
    const existing = await storeService.findByUserId(tienda.userId);

    if (!existing) {
      await storeService.create({
        ...tienda,
        shippingMethod: shippingMethods[i % shippingMethods.length],
        deliveryFee: deliveryFees[i % deliveryFees.length],
        phone: phoneNumbers[i % phoneNumbers.length],
        image: imageUrls[i % imageUrls.length],
        description: `Bienvenido a ${tienda.name}, ubicada en ${tienda.location}`,
        rating: 0,
        estimatedTime: `${20 + i * 2}-${30 + i * 2} min`,
      });
      console.log(`Tienda creada para usuario ${tienda.userId}`);
    } else {
      console.log(`Usuario ${tienda.userId} ya tiene una tienda`);
    }
  }

  await app.listen(process.env.PORT ?? 3000);
  app.enableCors({
    origin: '*',
  });
}

bootstrap();