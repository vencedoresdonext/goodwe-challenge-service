import { UserDTO } from './dto/user.dto';
import { CreateUserDto as CreateUserDTO } from './dto/create-user.dto';

export abstract class UserRepository {
  abstract create(data: CreateUserDTO): Promise<UserDTO>;
  abstract findByEmail(email: string): Promise<UserDTO | null>;
  abstract findById(id: string): Promise<UserDTO | null>;
  abstract addRoleToUser(userId: string, roleId: number): Promise<void>;
  abstract findRolesByUserId(userId: string): Promise<number[]>;
}
