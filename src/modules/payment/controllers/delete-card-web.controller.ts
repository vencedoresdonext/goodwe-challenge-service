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

@Controller()
export class DeleteCardWebController {
  constructor(
    private readonly deleteCustomerCardService: DeleteCustomerCardService,
  ) {}

  @Delete('web/cards/:id')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  async handle(
    @CurrentUser('sub') userId: string,
    @Param('id') cardId: string,
  ): Promise<HttpResponse<null>> {
    await this.deleteCustomerCardService.execute(userId, cardId);
    return { data: null };
  }
}
