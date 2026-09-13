export class CreateUserDto {
  email!: string;
  phone?: string;
  fullName?: string;
  password!: string;
  roleId?: number;
}
