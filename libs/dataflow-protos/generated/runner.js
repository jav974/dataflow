"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RUNNER_SERVICE_NAME = exports.RUNNER_PACKAGE_NAME = exports.protobufPackage = void 0;
exports.RunnerServiceControllerMethods = RunnerServiceControllerMethods;
const microservices_1 = require("@nestjs/microservices");
exports.protobufPackage = "runner";
exports.RUNNER_PACKAGE_NAME = "runner";
function RunnerServiceControllerMethods() {
    return function (constructor) {
        const grpcMethods = ["pause", "resume", "cancel"];
        for (const method of grpcMethods) {
            const descriptor = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            (0, microservices_1.GrpcMethod)("RunnerService", method)(constructor.prototype[method], method, descriptor);
        }
        const grpcStreamMethods = [];
        for (const method of grpcStreamMethods) {
            const descriptor = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            (0, microservices_1.GrpcStreamMethod)("RunnerService", method)(constructor.prototype[method], method, descriptor);
        }
    };
}
exports.RUNNER_SERVICE_NAME = "RunnerService";
//# sourceMappingURL=runner.js.map