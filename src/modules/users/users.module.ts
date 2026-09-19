import { Module } from '@nestjs/common';
import { FindProfileAppController } from './controllers/find-profile-app.controller';
import { UpdateProfileAppController } from './controllers/update-profile-app.controller';
import { FindProfileWebController } from './controllers/find-profile-web.controller';
import { UpdateProfileWebController } from './controllers/update-profile-web.controller';
import { FindProfileService } from './services/find-profile.service';
import { UpdateProfileService } from './services/update-profile.service';

@Module({
  controllers: [
    FindProfileAppController,
    UpdateProfileAppController,
    FindProfileWebController,
    UpdateProfileWebController,
  ],
  providers: [FindProfileService, UpdateProfileService],
})
export class UsersModule {}
