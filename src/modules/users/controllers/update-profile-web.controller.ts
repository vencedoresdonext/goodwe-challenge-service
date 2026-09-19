import { Controller, Patch, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UpdateProfileService } from '../services/update-profile.service';
import { UpdateProfileRequestDTO } from '../dto/request/update-profile-request.dto';
import { ProfileOutputDTO } from '../dto/io/profile-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators/route-type.decorator';
import { RouteTypeEnum } from '../../../common/enums';

@Controller()
export class UpdateProfileWebController {
  constructor(private readonly updateProfileService: UpdateProfileService) {}

  @Patch('web/me')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  async handle(
    @CurrentUser('sub') userId: string,
    @Body() input: UpdateProfileRequestDTO,
  ): Promise<HttpResponse<ProfileOutputDTO>> {
    const data = await this.updateProfileService.execute(userId, input);
    return { data };
  }
}
