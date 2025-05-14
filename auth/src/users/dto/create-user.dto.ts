import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
@IsEmail()
email: string;

@IsString()
@MinLength(6)
password: string;

@IsString()
firstName: string;

@IsString()
lastName: string;

@IsOptional()
@IsIn(['comprador', 'vendedor', 'repartidor', 'admin']) 
role?: string;
}