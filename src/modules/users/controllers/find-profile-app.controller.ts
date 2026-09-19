import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FindProfileService } from '../services/find-profile.service';
import { ProfileOutputDTO } from '../dto/io/profile-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators/route-type.decorator';
import { RouteTypeEnum } from '../../../common/enums';

@Controller()
export class FindProfileAppController {
  constructor(private readonly getProfileService: FindProfileService) {}

  @Get('app/me')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.APP)
  async handle(
    @CurrentUser('sub') userId: string,
  ): Promise<HttpResponse<ProfileOutputDTO>> {
    const data = await this.getProfileService.execute(userId);
    return { data };
  }
}
