import { RouteTypeEnum } from 'src/common/enums/route-type.enum';

export type LoginInputDTO = {
  identifier: string;
  password: string;
  routeType: RouteTypeEnum;
};

export type LoginOutputDTO = {
  accessToken: string;
  refreshToken: string;
};
