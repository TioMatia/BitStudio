import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  contactName: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  address: string;
}