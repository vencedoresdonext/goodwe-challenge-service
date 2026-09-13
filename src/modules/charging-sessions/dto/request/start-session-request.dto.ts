import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class StartSessionRequestDTO {
  @IsString()
  @IsNotEmpty()
  chargerId!: string;

  @IsString()
  @IsOptional()
  vehicleId?: string;

  @IsInt()
  @Min(0)
  preAuthorizedAmountCents!: number;
}
