import { IsUUID } from 'class-validator';

export class StationIdParamDTO {
  @IsUUID('4', { message: 'ID da estação deve ser um UUID válido' })
  id!: string;
}
