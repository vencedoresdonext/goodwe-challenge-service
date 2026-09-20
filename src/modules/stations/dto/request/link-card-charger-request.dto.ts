import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkCardChargerRequestDTO {
  @ApiProperty({
    description: 'ID do cartão a ser vinculado',
    example: 'uuid-1234',
  })
  @IsNotEmpty()
  @IsUUID()
  cardId: string;
}
