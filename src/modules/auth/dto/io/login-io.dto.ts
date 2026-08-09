import { RouteTypeEnum } from 'src/common/enums/route-type.enum';

export type LoginInputDTO = {
  routeType: RouteTypeEnum;
  password: string;
  email: string;
};

export type LoginOutputDTO = {
  accessToken: string;
  refreshToken: string;
};
