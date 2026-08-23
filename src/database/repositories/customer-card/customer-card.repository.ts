import { CustomerCardDTO } from './dto/customer-card.dto';
import { CreateCustomerCardDTO } from './dto/create-customer-card.dto';

export abstract class CustomerCardRepository {
  abstract create(data: CreateCustomerCardDTO): Promise<CustomerCardDTO>;
  abstract findById(id: string): Promise<CustomerCardDTO | null>;
  abstract findByUserId(userId: string): Promise<CustomerCardDTO[]>;
  abstract findByGatewayToken(token: string): Promise<CustomerCardDTO | null>;
  abstract delete(id: string): Promise<void>;
  abstract setDefault(userId: string, cardId: string): Promise<void>;
}
