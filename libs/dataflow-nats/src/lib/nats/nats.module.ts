import { Module } from '@nestjs/common';
import { NatsConnectionProvider } from './nats-connection.provider';
import { NatsService } from './nats.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_CLIENT } from './nats.constants';

const natsClient = ClientsModule.register([{
    name: NATS_CLIENT,
    transport: Transport.NATS,
    options: {
        servers: ['nats://localhost:4222'],
    }
}]);

@Module({
  providers: [NatsConnectionProvider, NatsService],
  exports: [NatsService, natsClient],
  imports: [natsClient],
})
export class NatsModule {}