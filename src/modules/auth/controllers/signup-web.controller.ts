import { Controller, Post, Body } from '@nestjs/common';
import { SignupService } from '../services/signup.service';
import { SignupRequestDTO } from '../dto/request/signup-request.dto';
import { SignupOutputDTO } from '../dto/io/signup-io.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { RouteTypeEnum } from '../../../common/enums/route-type.enum';
import { HttpResponse } from 'src/common/types';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Auth')
export class SignupWebController {
  constructor(private readonly signupService: SignupService) {}

  @Public()
  @Post('web/signup')
  @ApiOperation({ summary: 'Rota que permite o cadastro no WEB' })
  @ApiBody({ type: SignupRequestDTO })
  async handle(
    @Body() input: SignupRequestDTO,
  ): Promise<HttpResponse<SignupOutputDTO>> {
    const data = await this.signupService.execute({
      ...input,
      routeType: RouteTypeEnum.WEB,
    });
    return { data };
  }
}
