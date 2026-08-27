import { IsString, IsNotEmpty, IsInt, Min, IsEmail } from 'class-validator';

export class CreatePixChargeRequestDTO {
  @IsInt()
  @Min(1)
  amountCents: number;

  @IsString()
  @IsNotEmpty()
  chargerId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEmail()
  payerEmail: string;
}
