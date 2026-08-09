import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaUow {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('AllRepositories') public readonly repositories: any,
  ) {}

  async execute<T>(fn: (repositories: any) => Promise<T>): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return this.prisma.$transaction(async (_tx) => {
      // In a real scenario, you might want to replace the prisma client
      // inside each repository with the `tx` instance.
      // For now, we provide the repositories object as requested.
      return fn(this.repositories);
    });
  }
}
