import { NodeProvider } from "@dataflow-ui/contexts/NodeContext";
import AppContainer from "./AppContainer";
import { UserGraphProvider } from "@dataflow-ui/contexts/UserGraphContext";
import ErrorBoundary from "./ErrorBoundary";
import { GraphProvider } from "@dataflow-ui/contexts/GraphContext";
import { Executor, GraphExecutor, runGraph, runGraphWithController } from "@dataflow-ide/dataflow-core";
import { DataflowProvider } from "@dataflow-ui/contexts/DataflowContext";
import { DashboardProvider } from "@dataflow-ui/contexts/DashboardContext";
import { RealTimeProvider } from "@dataflow-ui/contexts/RealTimeContext";

interface DataflowProps {
    // Function to execute the graph locally. If not provided, fallback to integrated execution logic.
    // Allows for overriding the execution logic with custom implementation.
    localExecutor?: Executor;
    // Function to execute the graph remotely. If not provided, remote execution will not be available.
    // You can wrap the default local execution logic to provide a remote execution capability.
    remoteExecutor?: Executor;
    // URL to remote server Graph executor. If provided, will build a custom server executor
    // remoteExecutor property has the final word: either set it or this server url
    serverUrl?: string;
}

export default function Dataflow({ localExecutor = runGraphWithController, remoteExecutor, serverUrl }: DataflowProps) {
    return (
        <ErrorBoundary>
            <DataflowProvider
                remoteExecutor={remoteExecutor}
                localExecutor={localExecutor}
                serverUrl={serverUrl}
            >
                <RealTimeProvider url={process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL}>
                    <UserGraphProvider>
                        <GraphProvider>
                            <NodeProvider>
                                <DashboardProvider>
                                    <AppContainer />
                                </DashboardProvider>
                            </NodeProvider>
                        </GraphProvider>
                    </UserGraphProvider>
                </RealTimeProvider>
            </DataflowProvider>
        </ErrorBoundary>
    );
}
