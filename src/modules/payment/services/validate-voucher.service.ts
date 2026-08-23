import { Injectable, BadRequestException } from '@nestjs/common';
import { VoucherRepository } from '../../../database/repositories/voucher/voucher.repository';
import { ValidateVoucherInputDTO } from '../dto/io/validate-voucher-io.dto';
import { ValidateVoucherOutputDTO } from '../dto/io/validate-voucher-io.dto';
import { VoucherTypeEnum } from '../../../common/enums';

@Injectable()
export class ValidateVoucherService {
  constructor(private readonly voucherRepository: VoucherRepository) {}

  async execute(
    input: ValidateVoucherInputDTO,
  ): Promise<ValidateVoucherOutputDTO> {
    const voucher = await this.voucherRepository.findByCode(input.code);

    if (!voucher) {
      throw new BadRequestException('Voucher inválido');
    }

    if (!voucher.isActive) {
      throw new BadRequestException('Voucher inativo');
    }

    const now = new Date();
    if (now < voucher.validFrom || now > voucher.validUntil) {
      throw new BadRequestException('Voucher fora da validade');
    }

    if (voucher.currentUsages >= voucher.maxUsages) {
      throw new BadRequestException('Voucher atingiu o limite de usos');
    }

    let discountCents = 0;

    if (voucher.typeId === Number(VoucherTypeEnum.PERCENTAGE)) {
      discountCents = Math.floor((input.amountCents * voucher.value) / 100);
      if (
        voucher.maxAmountCents !== null &&
        discountCents > voucher.maxAmountCents
      ) {
        discountCents = voucher.maxAmountCents;
      }
    } else if (voucher.typeId === Number(VoucherTypeEnum.FIXED_AMOUNT)) {
      discountCents = voucher.value;
    }

    if (discountCents > input.amountCents) {
      discountCents = input.amountCents;
    }

    const finalAmountCents = input.amountCents - discountCents;

    return {
      voucherId: voucher.id,
      code: voucher.code,
      typeId: voucher.typeId,
      discountCents,
      finalAmountCents,
    };
  }
}
