import { Controller, Post, Body } from '@nestjs/common';
import { LoginService } from '../services/login.service';
import { LoginRequestDTO } from '../dto/request/login-request.dto';
import { LoginOutputDTO } from '../dto/io/login-io.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { RouteTypeEnum } from '../../../common/enums/route-type.enum';
import { HttpResponse } from 'src/common/types';
import { ApiBody, ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';

@Controller()
@ApiTags('Auth')
export class LoginAppController {
  constructor(private readonly loginService: LoginService) {}

  @Public()
  @Post('app/login')
  @ApiOperation({ summary: 'Rota que permite o Login no APP' })
  @ApiOkResponse({
    type: LoginOutputDTO,
    description: 'Login efetuado com sucesso',
  })
  @ApiBody({ type: LoginRequestDTO })
  async handle(
    @Body() input: LoginRequestDTO,
  ): Promise<HttpResponse<LoginOutputDTO>> {
    const data = await this.loginService.execute({
      ...input,
      routeType: RouteTypeEnum.APP,
    });
    return { data };
  }
}
