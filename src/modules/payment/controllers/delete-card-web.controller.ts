import {
  Controller,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { DeleteCustomerCardService } from '../services/delete-customer-card.service';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators';
import { RouteTypeEnum } from '../../../common/enums';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';

@Controller()
@ApiTags('Cartões')
@ApiBearerAuth('access')
export class DeleteCardWebController {
  constructor(
    private readonly deleteCustomerCardService: DeleteCustomerCardService,
  ) {}

  @Delete('web/cards/:id')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  @ApiOperation({ summary: 'Rota que permite excluir um cartão na WEB' })
  @ApiOkResponse({ description: 'Cartão excluído com sucesso' })
  @ApiParam({ name: 'id', type: String })
  async handle(
    @CurrentUser('sub') userId: string,
    @Param('id') cardId: string,
  ): Promise<HttpResponse<null>> {
    await this.deleteCustomerCardService.execute(userId, cardId);
    return { data: null };
  }
}
