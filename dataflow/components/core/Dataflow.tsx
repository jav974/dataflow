import { NodeProvider } from "@/dataflow/contexts/NodeContext";
import AppContainer from "./AppContainer";
import { UserGraphProvider } from "@/dataflow/contexts/UserGraphContext";
import ErrorBoundary from "./ErrorBoundary";
import { GraphProvider } from "@/dataflow/contexts/GraphContext";
import { GraphExecutor } from "@/dataflow/engine/types";
import { runGraph } from "@/dataflow/engine/graph";
import { DataflowProvider } from "@/dataflow/contexts/DataflowContext";
import { DashboardProvider } from "@/dataflow/contexts/DashboardContext";

interface DataflowProps {
    // Function to execute the graph locally. If not provided, fallback to integrated execution logic.
    // Allows for overriding the execution logic with custom implementation.
    localExecutor?: GraphExecutor;
    // Function to execute the graph remotely. If not provided, remote execution will not be available.
    // You can wrap the default local execution logic to provide a remote execution capability.
    remoteExecutor?: GraphExecutor;
}

export default function Dataflow({ localExecutor = runGraph, remoteExecutor }: DataflowProps) {
    return (
        <ErrorBoundary>
            <DataflowProvider
                remoteExecutor={remoteExecutor}
                localExecutor={localExecutor}
            >
                <UserGraphProvider>
                    <GraphProvider>
                        <NodeProvider>
                            <DashboardProvider>
                                <AppContainer />
                            </DashboardProvider>
                        </NodeProvider>
                    </GraphProvider>
                </UserGraphProvider>
            </DataflowProvider>
        </ErrorBoundary>
    );
}
