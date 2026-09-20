import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileRequestDTO {
  @ApiProperty({
    description: 'Novo nome completo do usuário',
    example: 'João Pedro Silva',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    description: 'Novo telefone do usuário',
    example: '+5511988888888',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
