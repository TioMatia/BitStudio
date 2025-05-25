import {IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsInt,
} from 'class-validator';

export class CreateInventoryDto {
@IsString()
@IsNotEmpty({ message: 'El nombre es obligatorio' })
name: string;

@IsOptional()
@IsString()
description?: string;

@IsNumber({}, { message: 'El precio debe ser un número' })
@Min(0, { message: 'El precio no puede ser negativo' })
price: number;

@IsInt({ message: 'La cantidad debe ser un número entero' })
@Min(0, { message: 'La cantidad no puede ser negativa' })
quantity: number;

@IsInt({ message: 'storeId debe ser un número entero' })
storeId: number;

@IsOptional()
@IsString({ message: 'La URL de imagen debe ser un texto' })
image?: string;
}