import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true, 
  });
  app.useGlobalPipes(new ValidationPipe());

   const usersService = app.get(UsersService);
    const usersToSeed = [
    {
      firstName: 'Admin',
      lastName: 'Admin',
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'admin',
    },
    {
      firstName: 'Matías',
      lastName: 'Comprador',
      email: 'comprador@comprador.com',
      password: 'comprador123',
      role: 'comprador',
    },
    {
      firstName: 'Lucía',
      lastName: 'Compradora',
      email: 'compradora@compradora.com',
      password: 'comprador123',
      role: 'comprador',
    },
    {
      firstName: 'Pedro',
      lastName: 'Vendedor', 
      email: 'pedro@vendedor.com',
      password: 'vendedor123',
      role: 'vendedor',
    },
    {
      firstName: 'Maria',
      lastName: 'Vendedora',
      email: 'maria@vendedor.com',
      password: 'vendedor123',
      role: 'vendedor',
    },
    {
      firstName: 'Matias',
      lastName: 'Vendedor',
      email: 'matias@vendedor.com',
      password: 'vendedor123',
      role: 'vendedor',
    },
    {
      firstName: 'Carolina',
      lastName: 'Vendedora',
      email: 'carolina@vendedor.com',
      password: 'vendedor123',
      role: 'vendedor',
    },

    {
      firstName: 'Jose',
      lastName: 'Vendedor',
      email: 'jose@vendedor.com',
      password: 'vendedor123',
      role: 'vendedor',
    },
    {
      firstName: 'Veronica',
      lastName: 'Vendedora',
      email: 'veronica@vendedor.com',
      password: 'vendedor123',
      role: 'vendedor',
    },
        {
      firstName: 'Nicolas',
      lastName: 'Vendedor',
      email: 'nicolas@vendedor.com',
      password: 'vendedor123',
      role: 'vendedor',
    },
    {
      firstName: 'Camila',
      lastName: 'Vendedora',
      email: 'camila@vendedor.com',
      password: 'vendedor123',
      role: 'vendedor',
    },
    {
      firstName: 'Benjamin',
      lastName: 'Vendedor',
      email: 'benjamin@vendedor.com',
      password: 'vendedor123',
      role: 'vendedor',
    },
  ];

     
      for (const user of usersToSeed) {
        const existing = await usersService.findByEmail(user.email);
        if (!existing) {
          await usersService.create(user);
          console.log(`Usuario ${user.email} creado`);
        } else {
          console.log(`Usuario ${user.email} ya existe`);
        }
      }

  await app.listen(3000);
}
bootstrap();
 