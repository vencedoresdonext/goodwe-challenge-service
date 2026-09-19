import { Controller, Post, Body } from '@nestjs/common';
import { LoginService } from '../services/login.service';
import { LoginRequestDTO } from '../dto/request/login-request.dto';
import { LoginOutputDTO } from '../dto/io/login-io.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { RouteTypeEnum } from '../../../common/enums/route-type.enum';
import { HttpResponse } from 'src/common/types';

@Controller()
export class LoginWebController {
  constructor(private readonly loginService: LoginService) {}

  @Public()
  @Post('web/login')
  async handle(
    @Body() input: LoginRequestDTO,
  ): Promise<HttpResponse<LoginOutputDTO>> {
    const data = await this.loginService.execute({
      ...input,
      routeType: RouteTypeEnum.WEB,
    });
    return { data };
  }
}
