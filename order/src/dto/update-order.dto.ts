import { IsIn, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['Pendiente', 'Disponible para retiro', 'Disponible para delivery'])
  status: string;
}
