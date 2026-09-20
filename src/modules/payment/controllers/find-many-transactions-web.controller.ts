import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FindManyTransactionsWebService } from '../services/find-many-transactions-web.service';
import { FindManyTransactionsQueryParamsDTO } from '../dto/query-params/find-many-transactions-query-params.dto';
import { PaymentTransactionOutputDTO } from '../dto/io/transaction-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators/route-type.decorator';
import { RouteTypeEnum } from '../../../common/enums';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';

@Controller()
@ApiTags('Transações')
@ApiBearerAuth('access')
export class FindManyTransactionsWebController {
  constructor(
    private readonly findManyTransactionsService: FindManyTransactionsWebService,
  ) {}

  @Get('web/transactions')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  @ApiOperation({
    summary: 'Rota que permite buscar todas as transações na WEB',
  })
  @ApiOkResponse({
    type: [PaymentTransactionOutputDTO],
    description: 'Lista de transações retornada com sucesso',
  })
  @ApiQuery({ name: 'query', type: FindManyTransactionsQueryParamsDTO })
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
