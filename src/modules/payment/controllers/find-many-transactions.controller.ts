import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FindManyTransactionsService } from '../services/find-many-transactions.service';
import { FindManyTransactionsQueryParamsDTO } from '../dto/query-params/find-many-transactions-query-params.dto';
import { PaymentTransactionOutputDTO } from '../dto/io/transaction-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators/route-type.decorator';
import { RouteTypeEnum } from '../../../common/enums';

@Controller()
export class FindManyTransactionsController {
  constructor(
    private readonly findManyTransactionsService: FindManyTransactionsService,
  ) {}

  @Get('transactions')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.APP)
  async handle(
    @CurrentUser('sub') userId: string,
    @Query() query: FindManyTransactionsQueryParamsDTO,
  ): Promise<HttpResponse<PaymentTransactionOutputDTO[]>> {
    const skipNum = query.skip ?? 0;
    const takeNum = query.take ?? 20;

    const data = await this.findManyTransactionsService.execute(
      userId,
      skipNum,
      takeNum,
    );
    return { data };
  }
}
