import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsEmail,
  IsOptional,
} from 'class-validator';

export class ProcessCreditCardRequestDTO {
  @IsString()
  @IsNotEmpty()
  customerCardId: string;

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

  @IsInt()
  @Min(1)
  @IsOptional()
  installments?: number;

  @IsString()
  @IsOptional()
  voucherCode?: string;
}
