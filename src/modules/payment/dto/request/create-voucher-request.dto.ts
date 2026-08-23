import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { VoucherTypeEnum } from '../../../../common/enums';

export class CreateVoucherRequestDTO {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(VoucherTypeEnum)
  typeId: number;

  @IsInt()
  @Min(1)
  value: number;

  @IsInt()
  @Min(1)
  maxUsages: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  maxAmountCents?: number;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validUntil: string;
}
