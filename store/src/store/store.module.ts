import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../entities/store.entity';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { HttpModule } from '@nestjs/axios'; 
import { CloudinaryModule } from '../cloudinary/cloudinary.module'

@Module({
  imports: [
            TypeOrmModule.forFeature([Store]),
            HttpModule,
            CloudinaryModule
          ],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
