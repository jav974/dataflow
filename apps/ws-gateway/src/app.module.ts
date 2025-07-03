import { Module } from '@nestjs/common';
import { WSGateway } from './app.gateway';

@Module({
  providers: [WSGateway],
})
export class AppModule {}
