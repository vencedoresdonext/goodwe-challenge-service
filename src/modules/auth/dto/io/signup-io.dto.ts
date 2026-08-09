import { RouteTypeEnum } from 'src/common/enums/route-type.enum';

export type SignupInputDTO = {
  routeType: RouteTypeEnum;
  password: string;
  email: string;
};

export type SignupOutputDTO = {
  accessToken: string;
  refreshToken: string;
};
