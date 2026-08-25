import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUow } from './uow/prisma.uow';
import { UserRepository } from './repositories/user/user.repository';
import { PrismaUserRepository } from './repositories/user/prisma-user.repository';
import { CustomerCardRepository } from './repositories/customer-card/customer-card.repository';
import { PrismaCustomerCardRepository } from './repositories/customer-card/prisma-customer-card.repository';
import { PaymentTransactionRepository } from './repositories/payment-transaction/payment-transaction.repository';
import { PrismaPaymentTransactionRepository } from './repositories/payment-transaction/prisma-payment-transaction.repository';
import { ChargerSessionRepository } from './repositories/charger-session/charger-session.repository';
import { PrismaChargerSessionRepository } from './repositories/charger-session/prisma-charger-session.repository';
import { ChargerRepository } from './repositories/charger/charger.repository';
import { PrismaChargerRepository } from './repositories/charger/prisma-charger.repository';

// 1. Mapeamento dos repositórios: Contrato (Abstract Class) -> Implementação Prisma
const serviceRepositories = new Map<any, any>([
  [UserRepository, PrismaUserRepository],
  [CustomerCardRepository, PrismaCustomerCardRepository],
  [PaymentTransactionRepository, PrismaPaymentTransactionRepository],
  [ChargerSessionRepository, PrismaChargerSessionRepository],
  [ChargerRepository, PrismaChargerRepository],
]);

@Global()
@Module({
  providers: [
    PrismaService,
    PrismaUow,
    ...Array.from(serviceRepositories.values()),
    ...Array.from(serviceRepositories.entries()).map(([contract, impl]) => ({
      provide: contract,
      useExisting: impl,
    })),
    {
      provide: 'AllRepositories',
      useFactory: (...prismaRepositories: any[]) => {
        return prismaRepositories.reduce((acc, impl, index) => {
          const name = prismaRepositories[index].constructor.name;

          if (name.substring(0, 6) != 'Prisma') {
            throw new Error(`Erro ao injetar o repositório ${name}`);
          }

          const formattedName = name[6].toLowerCase() + name.substring(7);

          return { ...acc, [formattedName]: impl };
        }, {});
      },
      inject: Array.from(serviceRepositories.values()),
    },
  ],
  exports: [
    PrismaService,
    PrismaUow,
    ...Array.from(serviceRepositories.keys()),
    'AllRepositories',
  ],
})
export class DatabaseModule {}
