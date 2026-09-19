import { IsNotEmpty, IsUUID } from 'class-validator';

export class LinkCardChargerRequestDTO {
  @IsNotEmpty()
  @IsUUID()
  cardId: string;
}
