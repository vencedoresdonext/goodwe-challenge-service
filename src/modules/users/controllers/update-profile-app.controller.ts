import { Controller, Patch, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UpdateProfileService } from '../services/update-profile.service';
import { UpdateProfileRequestDTO } from '../dto/request/update-profile-request.dto';
import { ProfileOutputDTO } from '../dto/io/profile-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators/route-type.decorator';
import { RouteTypeEnum } from '../../../common/enums';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';

@Controller()
@ApiTags('Usuários')
@ApiBearerAuth('access')
export class UpdateProfileAppController {
  constructor(private readonly updateProfileService: UpdateProfileService) {}

  @Patch('app/me')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.APP)
  @ApiOperation({
    summary: 'Rota que permite atualizar o perfil do usuário no APP',
  })
  @ApiOkResponse({
    type: ProfileOutputDTO,
    description: 'Perfil atualizado com sucesso',
  })
  @ApiBody({ type: UpdateProfileRequestDTO })
  async handle(
    @CurrentUser('sub') userId: string,
    @Body() input: UpdateProfileRequestDTO,
  ): Promise<HttpResponse<ProfileOutputDTO>> {
    const data = await this.updateProfileService.execute(userId, input);
    return { data };
  }
}
