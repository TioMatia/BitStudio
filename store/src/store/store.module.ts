import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../entities/store.entity';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { HttpModule } from '@nestjs/axios'; 

@Module({
  imports: [TypeOrmModule.forFeature([Store]),
            HttpModule],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
