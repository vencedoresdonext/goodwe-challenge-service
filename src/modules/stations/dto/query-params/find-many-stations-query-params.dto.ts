import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindManyStationsQueryParamsDTO {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  latitude!: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  longitude!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  radiusKm?: number = 10;
}
