import { type AuthenticatedUser } from '../../../common/types';
import { DeleteCustomerCardService } from '../services/delete-customer-card.service';
import {
  Controller,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IdParamDTO } from '../dto/params/id-param.dto';
import { CurrentUser } from 'src/common/decorators';
import { RouteTypeGuard } from '../../../common/decorators';
import { RouteTypeEnum } from '../../../common/enums';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiNoContentResponse,
} from '@nestjs/swagger';

@Controller()
@ApiTags('Cartões')
@ApiBearerAuth('access')
export class DeleteCardController {
  constructor(private readonly deleteCardService: DeleteCustomerCardService) {}

  @Delete('cards/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RouteTypeGuard(RouteTypeEnum.APP)
  @ApiOperation({ summary: 'Rota que permite excluir um cartão' })
  @ApiNoContentResponse({ description: 'Cartão excluído com sucesso' })
  @ApiParam({ name: 'id', type: String })
  async handle(
    @Param() params: IdParamDTO,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.deleteCardService.execute(user.sub, params.id);
  }
}
