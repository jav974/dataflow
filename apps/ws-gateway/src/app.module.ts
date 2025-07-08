import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WSGateway } from './app.gateway';
import { NatsModule } from '@dataflow-ide/dataflow-nats';

@Module({
    providers: [WSGateway],
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,           // if you want it everywhere
            envFilePath: '.env',      // default, but can be customized
        }),
        NatsModule
    ],
})
export class AppModule {}
