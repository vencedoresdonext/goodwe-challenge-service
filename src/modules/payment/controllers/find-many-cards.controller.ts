import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ListCustomerCardsService } from '../services/list-customer-cards.service';
import { ListCustomerCardsOutputDTO } from '../dto/io/list-customer-cards-io.dto';
import { type AuthenticatedUser, HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators';
import { RouteTypeEnum } from '../../../common/enums';

@Controller()
export class FindManyCardsController {
  constructor(private readonly listCardsService: ListCustomerCardsService) {}

  @Get('cards')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.APP)
  async handle(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HttpResponse<ListCustomerCardsOutputDTO[]>> {
    const data = await this.listCardsService.execute(user.sub);

    return { data };
  }
}
