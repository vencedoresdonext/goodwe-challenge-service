import { IsOptional, IsString, IsObject } from 'class-validator';

export class PaymentWebhookRequestDTO {
  @IsOptional()
  id?: string | number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  statusId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsObject()
  data?: {
    id?: string | number;
    statusId?: string;
  };
}
