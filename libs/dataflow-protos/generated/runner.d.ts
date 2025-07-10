import type { Metadata } from "@grpc/grpc-js";
import { Observable } from "rxjs";
export declare const protobufPackage = "runner";
export interface RunnerCommand {
    socketId: string;
}
export interface Ack {
    status: string;
}
export declare const RUNNER_PACKAGE_NAME = "runner";
export interface RunnerServiceClient {
    pause(request: RunnerCommand, metadata: Metadata, ...rest: any): Observable<Ack>;
    resume(request: RunnerCommand, metadata: Metadata, ...rest: any): Observable<Ack>;
    cancel(request: RunnerCommand, metadata: Metadata, ...rest: any): Observable<Ack>;
}
export interface RunnerServiceController {
    pause(request: RunnerCommand, metadata: Metadata, ...rest: any): Promise<Ack> | Observable<Ack> | Ack;
    resume(request: RunnerCommand, metadata: Metadata, ...rest: any): Promise<Ack> | Observable<Ack> | Ack;
    cancel(request: RunnerCommand, metadata: Metadata, ...rest: any): Promise<Ack> | Observable<Ack> | Ack;
}
export declare function RunnerServiceControllerMethods(): (constructor: Function) => void;
export declare const RUNNER_SERVICE_NAME = "RunnerService";
