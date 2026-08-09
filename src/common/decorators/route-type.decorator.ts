import { SetMetadata } from '@nestjs/common';
import { RouteTypeEnum } from '../enums/route-type.enum';

export const ROUTE_TYPE_KEY = 'routeType';
export const RouteTypeGuard = (type: RouteTypeEnum) =>
  SetMetadata(ROUTE_TYPE_KEY, type);
