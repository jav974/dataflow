import { Module } from '@nestjs/common';
import { NatsController } from './nats.controller';
import { NatsConnectionProvider } from './nats-connection.provider';
import { NatsService } from './nats.service';

@Module({
  controllers: [NatsController],
  providers: [NatsConnectionProvider, NatsService],
  exports: [NatsService],
})
export class NatsModule {}