import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ListCustomerCardsService } from '../services/list-customer-cards.service';
import { ListCustomerCardsOutputDTO } from '../dto/io/list-customer-cards-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators';
import { RouteTypeEnum } from '../../../common/enums';

@Controller()
export class FindManyCardsWebController {
  constructor(
    private readonly listCustomerCardsService: ListCustomerCardsService,
  ) {}

  @Get('web/cards')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  async handle(
    @CurrentUser('sub') userId: string,
  ): Promise<HttpResponse<ListCustomerCardsOutputDTO[]>> {
    const data = await this.listCustomerCardsService.execute(userId);
    return { data };
  }
}
