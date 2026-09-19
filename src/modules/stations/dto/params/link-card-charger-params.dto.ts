import { IsUUID, IsNotEmpty } from 'class-validator';

export class LinkCardChargerParamsDTO {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
