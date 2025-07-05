import { Module } from '@nestjs/common';
import { WSGateway } from './app.gateway';
import { NatsModule } from '@dataflow-ide/dataflow-nats';

@Module({
    providers: [WSGateway],
    imports: [NatsModule],
})
export class AppModule {}
