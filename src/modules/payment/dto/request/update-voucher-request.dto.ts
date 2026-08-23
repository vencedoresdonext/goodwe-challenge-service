import {
  IsString,
  IsInt,
  Min,
  IsDateString,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { VoucherTypeEnum } from '../../../../common/enums';

export class UpdateVoucherRequestDTO {
  @IsString()
  @IsOptional()
  code?: string;

  @IsEnum(VoucherTypeEnum)
  @IsOptional()
  typeId?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  value?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxUsages?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  maxAmountCents?: number;

  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
