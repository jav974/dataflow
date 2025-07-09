import { Module } from '@nestjs/common';
import { NatsConnectionProvider } from './nats-connection.provider';
import { NatsService } from './nats.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_CLIENT } from './nats.constants';

const natsClient = ClientsModule.registerAsync([{
    name: NATS_CLIENT,
    useFactory: () => ({
        transport: Transport.NATS,
        options: {
            servers: [process.env.NATS_SERVER_URL as string],
        },
    }),
}]);

@Module({
    providers: [NatsConnectionProvider, NatsService],
    exports: [NatsService, natsClient],
    imports: [natsClient],
})
export class NatsModule {}