import { RouteTypeEnum } from 'src/common/enums/route-type.enum';

export type LoginInputDTO = {
  identifier: string;
  password: string;
  routeType: RouteTypeEnum;
};

import { ApiProperty } from '@nestjs/swagger';

export class LoginOutputDTO {
  @ApiProperty({
    description: 'Token de acesso JWT (curta duração)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token de atualização JWT (longa duração)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}
