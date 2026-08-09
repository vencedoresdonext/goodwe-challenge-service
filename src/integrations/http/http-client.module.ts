import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpClientService } from './http-client.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10_000,
      maxRedirects: 3,
    }),
  ],
  providers: [HttpClientService],
  exports: [HttpClientService],
})
export class HttpClientModule {}
