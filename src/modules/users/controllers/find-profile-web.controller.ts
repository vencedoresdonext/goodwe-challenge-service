import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FindProfileService } from '../services/find-profile.service';
import { ProfileOutputDTO } from '../dto/io/profile-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators/route-type.decorator';
import { RouteTypeEnum } from '../../../common/enums';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Perfil')
@ApiBearerAuth('access')
export class FindProfileWebController {
  constructor(private readonly getProfileService: FindProfileService) {}

  @Get('web/me')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  @ApiOperation({ summary: 'Rota que permite buscar o perfil do usuário' })
  async handle(
    @CurrentUser('sub') userId: string,
  ): Promise<HttpResponse<ProfileOutputDTO>> {
    const data = await this.getProfileService.execute(userId);
    return { data };
  }
}
