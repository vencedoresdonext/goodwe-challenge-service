import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDTO } from './dto/user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<UserDTO> {
    return this.prisma.user.create({
      data: {
        ...data,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmail(email: string): Promise<UserDTO | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByPhone(phone: string): Promise<UserDTO | null> {
    return this.prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string): Promise<UserDTO | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, data: Partial<UserDTO>): Promise<UserDTO> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        password: true,
        createdAt: true,
        updatedAt: true,
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
