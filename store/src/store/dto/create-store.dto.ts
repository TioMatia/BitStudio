import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateStoreDto {
@IsString()
name: string;

@IsString()
owner: string;

@IsString()
location: string;

@IsNumber()
userId: number

@IsOptional()
@IsString()
phone?: string;

@IsOptional()
@IsString()
description?: string;

@IsOptional()
@IsString()
image?: string;

@IsOptional()
@IsNumber()
deliveryFee?: number;

@IsOptional()
@IsNumber()
rating?: number;

@IsOptional()
@IsString()
estimatedTime?: string;

shippingMethod: 'delivery' | 'pickup' | 'both';

}