import { UserDTO } from './dto/user.dto';
import { CreateUserDto as CreateUserDTO } from './dto/create-user.dto';

export abstract class UserRepository {
  abstract create(data: CreateUserDTO): Promise<UserDTO>;
  abstract findByEmail(email: string): Promise<UserDTO | null>;
  abstract findByPhone(phone: string): Promise<UserDTO | null>;
  abstract findById(id: string): Promise<UserDTO | null>;
  abstract update(id: string, data: Partial<UserDTO>): Promise<UserDTO>;
  abstract findRolesByUserId(userId: string): Promise<number[]>;
}
