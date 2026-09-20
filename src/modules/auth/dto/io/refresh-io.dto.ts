import { RouteTypeEnum } from '../../../../common/enums/route-type.enum';

export type RefreshInputDTO = {
  refreshToken: string;
  routeType: RouteTypeEnum;
};

import { ApiProperty } from '@nestjs/swagger';

export class RefreshOutputDTO {
  @ApiProperty({
    description: 'Novo Token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Novo Token de atualização JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}
