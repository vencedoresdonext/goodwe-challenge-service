import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileRequestDTO {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
