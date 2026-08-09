import { Module } from '@nestjs/common';
import { LoginAppController } from './controllers/login-app.controller';
import { SignupAppController } from './controllers/signup-app.controller';
import { LoginWebController } from './controllers/login-web.controller';
import { SignupWebController } from './controllers/signup-web.controller';
import { RefreshAppController } from './controllers/refresh-app.controller';
import { RefreshWebController } from './controllers/refresh-web.controller';
import { LoginService } from './services/login.service';
import { SignupService } from './services/signup.service';
import { RefreshService } from './services/refresh.service';
import { TokenService } from './services/token.service';

@Module({
  controllers: [
    LoginAppController,
    SignupAppController,
    LoginWebController,
    SignupWebController,
    RefreshAppController,
    RefreshWebController,
  ],
  providers: [LoginService, SignupService, RefreshService, TokenService],
})
export class AuthModule {}
