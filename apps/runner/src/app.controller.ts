import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RunnerServiceController, RunnerCommand, Ack } from '@dataflow-ide/dataflow-protos';

@Controller()
export class AppController implements RunnerServiceController {
  @GrpcMethod('RunnerService', 'Pause')
  pause(command: RunnerCommand): Ack {
    console.log(`Pausing client ${command.socketId}`);
    return { status: 'ok' };
  }

  @GrpcMethod('RunnerService', 'Resume')
  resume(command: RunnerCommand): Ack {
    console.log(`Resuming client ${command.socketId}`);
    return { status: 'ok' };
  }

  @GrpcMethod('RunnerService', 'Cancel')
  cancel(command: RunnerCommand): Ack {
    console.log(`Cancelling client ${command.socketId}`);
    return { status: 'ok' };
  }
}