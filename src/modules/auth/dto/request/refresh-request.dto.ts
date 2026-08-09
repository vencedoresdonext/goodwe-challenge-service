import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshRequestDTO {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
