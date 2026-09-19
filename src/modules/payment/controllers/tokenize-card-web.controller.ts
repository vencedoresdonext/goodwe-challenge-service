import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { TokenizeCardService } from '../services/tokenize-card.service';
import { TokenizeCardRequestDTO } from '../dto/request/tokenize-card-request.dto';
import { TokenizeCardOutputDTO } from '../dto/io/tokenize-card-io.dto';
import { type AuthenticatedUser, HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators';
import { RouteTypeEnum } from '../../../common/enums';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Pagamentos')
@ApiBearerAuth('access')
export class TokenizeCardWebController {
  constructor(private readonly tokenizeCardService: TokenizeCardService) {}

  @Post('web/cards/tokenize')
  @HttpCode(HttpStatus.CREATED)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  @ApiOperation({ summary: 'Rota que permite tokenizar um cartão' })
  @ApiBody({ type: TokenizeCardRequestDTO })
  async handle(
    @Body() input: TokenizeCardRequestDTO,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HttpResponse<TokenizeCardOutputDTO>> {
    const data = await this.tokenizeCardService.execute({
      userId: user.sub,
      ...input,
    });

    return { data };
  }
}
