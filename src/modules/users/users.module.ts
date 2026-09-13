import { Module } from '@nestjs/common';
import { FindProfileController } from './controllers/find-profile.controller';
import { UpdateProfileController } from './controllers/update-profile.controller';
import { FindProfileService } from './services/find-profile.service';
import { UpdateProfileService } from './services/update-profile.service';

@Module({
  controllers: [FindProfileController, UpdateProfileController],
  providers: [FindProfileService, UpdateProfileService],
})
export class UsersModule {}
