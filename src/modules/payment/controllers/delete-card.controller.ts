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
@Controller()
export class DeleteCardController {
  constructor(private readonly deleteCardService: DeleteCustomerCardService) {}

  @Delete('cards/:id')
  @RouteTypeGuard(RouteTypeEnum.APP)
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(
    @Param() params: IdParamDTO,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.deleteCardService.execute(user.sub, params.id);
  }
}
