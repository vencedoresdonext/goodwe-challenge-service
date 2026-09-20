import { ApiProperty } from '@nestjs/swagger';

export class ProfileOutputDTO {
  @ApiProperty({ description: 'ID do usuário', example: 'uuid-1234' })
  id: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João da Silva',
    required: false,
    nullable: true,
  })
  fullName: string | null;

  @ApiProperty({
    description: 'Telefone do usuário',
    example: '+5511999999999',
    required: false,
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({ description: 'Data de criação do perfil' })
  createdAt: Date;
}
