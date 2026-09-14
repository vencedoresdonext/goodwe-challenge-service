import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVehicleRequestDTO {
  @IsString()
  @IsNotEmpty()
  plate!: string;

  @IsString()
  @IsNotEmpty()
  brand!: string;

  @IsString()
  @IsNotEmpty()
  model!: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
