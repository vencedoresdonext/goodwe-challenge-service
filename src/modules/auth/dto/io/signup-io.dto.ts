import { RouteTypeEnum } from 'src/common/enums/route-type.enum';

export type SignupInputDTO = {
  routeType: RouteTypeEnum;
  password: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  roles?: string[];
};

import { ApiProperty } from '@nestjs/swagger';

export class SignupOutputDTO {
  @ApiProperty({
    description: 'Token de acesso JWT recém-criado',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token de atualização JWT recém-criado',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}
