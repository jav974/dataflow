import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WSGateway } from './app.gateway';
import { NatsModule } from '@dataflow-ide/dataflow-nats';
import { RunnerController } from './runner.controller';

@Module({
    controllers: [RunnerController],
    providers: [WSGateway],
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
        }),
        NatsModule,
    ],
})
export class AppModule {}
