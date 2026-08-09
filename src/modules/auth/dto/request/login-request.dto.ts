import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class LoginRequestDTO {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'A senha deve ter no mínimo 8 caracteres, contendo pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial',
    },
  )
  password!: string;
}
