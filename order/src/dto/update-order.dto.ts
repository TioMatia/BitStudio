import { IsIn, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['pendiente', 'Disponible para retiro', 'Disponible para delivery'])
  status: string;
}
