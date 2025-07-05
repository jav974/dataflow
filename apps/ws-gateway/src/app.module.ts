import { ClientsModule, Transport } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { WSGateway } from './app.gateway';
import { NatsModule } from '@dataflow-ide/dataflow-nats';
// import { join } from 'path';

@Module({
    providers: [WSGateway],
    imports: [
        NatsModule,
        // ClientsModule.register([{
        //     name: 'RUNNER_PACKAGE',
        //     transport: Transport.GRPC,
        //     options: {
        //         url: 'localhost:50051',
        //         package: 'runner',
        //         protoPath: join(__dirname, '../../../libs/dataflow-protos/src/runner.proto'),
        //     },
        // }]),
      ClientsModule.register([{
        name: 'RUNNER_PACKAGE',
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
        }
      }]),
    ],
})
export class AppModule {}
