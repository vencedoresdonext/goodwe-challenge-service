import { VoucherDTO } from './dto/voucher.dto';
import { CreateVoucherDTO } from './dto/create-voucher.dto';
import { UpdateVoucherDTO } from './dto/update-voucher.dto';

export abstract class VoucherRepository {
  abstract create(data: CreateVoucherDTO): Promise<VoucherDTO>;
  abstract findById(id: string): Promise<VoucherDTO | null>;
  abstract findByCode(code: string): Promise<VoucherDTO | null>;
  abstract update(id: string, data: UpdateVoucherDTO): Promise<VoucherDTO>;
  abstract incrementUsage(id: string): Promise<VoucherDTO>;
  abstract deactivate(id: string): Promise<void>;
  abstract findAll(skip: number, take: number): Promise<VoucherDTO[]>;
}
