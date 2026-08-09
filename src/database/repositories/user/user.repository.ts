import { User } from '@prisma/client';
import { CreateUserDto as CreateUserDTO } from './dto/create-user.dto';

export abstract class UserRepository {
  abstract create(data: CreateUserDTO): Promise<User>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract addRoleToUser(userId: string, roleId: number): Promise<void>;
  abstract findRolesByUserId(userId: string): Promise<number[]>;
}
