import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { NatsModule } from '@dataflow-ide/dataflow-nats';

@Module({
  imports: [NatsModule],
//   controllers: [AppController],
//   providers: [AppService],
})
export class AppModule {}
