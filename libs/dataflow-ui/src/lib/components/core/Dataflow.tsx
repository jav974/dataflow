import { NodeProvider } from "@dataflow-ui/contexts/NodeContext";
import AppContainer from "./AppContainer";
import { UserGraphProvider } from "@dataflow-ui/contexts/UserGraphContext";
import ErrorBoundary from "./ErrorBoundary";
import { GraphProvider } from "@dataflow-ui/contexts/GraphContext";
import { DataflowProvider } from "@dataflow-ui/contexts/DataflowContext";
import { DashboardProvider } from "@dataflow-ui/contexts/DashboardContext";
import { RealTimeProvider } from "@dataflow-ui/contexts/RealTimeContext";

export default function Dataflow() {
    return (
        <ErrorBoundary>
            <DataflowProvider>
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
