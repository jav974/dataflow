import { NodeProvider } from "@/dataflow/contexts/NodeContext";
import AppContainer from "./AppContainer";
import { UserGraphProvider } from "@/dataflow/contexts/UserGraphContext";
import ErrorBoundary from "./ErrorBoundary";
import { GraphProvider } from "@/dataflow/contexts/GraphContext";
import { GraphExecutor } from "@/dataflow/engine/types";
import { runGraph } from "@/dataflow/engine/graph";
import { DataflowProvider } from "@/dataflow/contexts/DataflowContext";
import { DashboardProvider } from "@/dataflow/contexts/DashboardContext";
import { RealTimeProvider } from "@/dataflow/contexts/RealTimeContext";

interface DataflowProps {
    // Function to execute the graph locally. If not provided, fallback to integrated execution logic.
    // Allows for overriding the execution logic with custom implementation.
    localExecutor?: GraphExecutor;
    // Function to execute the graph remotely. If not provided, remote execution will not be available.
    // You can wrap the default local execution logic to provide a remote execution capability.
    remoteExecutor?: GraphExecutor;
    // URL to remote server Graph executor. If provided, will build a custom server executor
    // remoteExecutor property has the final word: either set it or this server url
    serverUrl?: string;
}

export default function Dataflow({ localExecutor = runGraph, remoteExecutor, serverUrl }: DataflowProps) {
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
