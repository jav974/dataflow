import { Module } from '@nestjs/common';
import { NatsModule } from '@dataflow-ide/dataflow-nats';

@Module({
  imports: [NatsModule]
})
export class AppModule {}
