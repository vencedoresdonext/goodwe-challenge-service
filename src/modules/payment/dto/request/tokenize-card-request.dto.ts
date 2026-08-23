import { IsString, IsNotEmpty, IsInt, Min, Max, Length } from 'class-validator';

export class TokenizeCardRequestDTO {
  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  holderName: string;

  @IsInt()
  @Min(1)
  @Max(12)
  expirationMonth: number;

  @IsInt()
  @Min(2024)
  expirationYear: number;

  @IsString()
  @IsNotEmpty()
  securityCode: string;

  @IsString()
  @IsNotEmpty()
  identificationType: string;

  @IsString()
  @IsNotEmpty()
  identificationNumber: string;
}
