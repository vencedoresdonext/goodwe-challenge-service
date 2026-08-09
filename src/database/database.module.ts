import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUow } from './uow/prisma.uow';
import { UserRepository } from './repositories/user/user.repository';
import { PrismaUserRepository } from './repositories/user/prisma-user.repository';

// 1. Mapeamento dos repositórios: Contrato (Abstract Class) -> Implementação Prisma
const serviceRepositories = new Map<any, any>([
  [UserRepository, PrismaUserRepository],
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
