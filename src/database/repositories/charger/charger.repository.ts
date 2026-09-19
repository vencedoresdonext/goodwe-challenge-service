import { ChargerDTO } from './dto/charger.dto';

export abstract class ChargerRepository {
  abstract findById(id: string): Promise<ChargerDTO | null>;
  abstract updateReceiverCard(id: string, cardId: string): Promise<ChargerDTO>;
}
