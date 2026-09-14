import { IsUUID } from 'class-validator';

export class VehicleIdParamDTO {
  @IsUUID('4', { message: 'ID do veículo deve ser um UUID válido' })
  id!: string;
}
