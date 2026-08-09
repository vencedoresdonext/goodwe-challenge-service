import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { User } from '@prisma/client';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async addRoleToUser(userId: string, roleId: number): Promise<void> {
    await this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  async findRolesByUserId(userId: string): Promise<number[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      select: { roleId: true },
    });

    return userRoles.map((ur) => ur.roleId);
  }
}
