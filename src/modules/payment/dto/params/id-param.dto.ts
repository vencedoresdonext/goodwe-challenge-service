import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class IdParamDTO {
  @IsString()
  @IsNotEmpty()
  @IsUUID(4, { message: 'ID deve ser um UUID válido' })
  id: string;
}
