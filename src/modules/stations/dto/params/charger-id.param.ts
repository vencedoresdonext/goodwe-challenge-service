import { IsUUID } from 'class-validator';

export class ChargerIdParamDTO {
  @IsUUID('4', { message: 'ID do carregador deve ser um UUID válido' })
  id!: string;
}
