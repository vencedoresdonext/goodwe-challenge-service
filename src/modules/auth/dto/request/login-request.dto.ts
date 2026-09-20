import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDTO {
  @ApiProperty({
    description: 'Email ou Telefone do usuário',
    example: 'joao@example.com',
  })
  @IsString()
  @IsNotEmpty({ message: 'O email ou telefone é obrigatório' })
  identifier!: string;

  @ApiProperty({ description: 'Senha do usuário', example: 'SenhaForte123!' })
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
