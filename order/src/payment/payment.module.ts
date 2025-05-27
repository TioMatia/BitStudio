import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { User } from '../entities/user.entity'; 
import { JwtStrategy } from '../decorators/jwt.strategy';
@Module({
imports: [TypeOrmModule.forFeature([User])],
controllers: [PaymentController],
providers: [PaymentService,  JwtStrategy],
})
export class PaymentModule {}