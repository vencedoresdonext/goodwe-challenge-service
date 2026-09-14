export type UserDTO = {
  id: string;
  email: string;
  phone?: string | null;
  fullName?: string | null;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
};
