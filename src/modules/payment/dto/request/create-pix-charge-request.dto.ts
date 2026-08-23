import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsEmail,
  IsOptional,
} from 'class-validator';

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

  @IsString()
  @IsOptional()
  voucherCode?: string;
}
