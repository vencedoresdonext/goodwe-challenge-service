import { RouteTypeEnum } from '../../../../common/enums/route-type.enum';

export type RefreshInputDTO = {
  refreshToken: string;
  routeType: RouteTypeEnum;
};

export type RefreshOutputDTO = {
  accessToken: string;
  refreshToken: string;
};
