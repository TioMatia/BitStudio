import { IsInt, Min } from 'class-validator';

export class UpdateQuantityDto {
@IsInt({ message: 'La cantidad debe ser un número entero' })
@Min(0, { message: 'La cantidad no puede ser menor que 0' })
quantity: number;
}