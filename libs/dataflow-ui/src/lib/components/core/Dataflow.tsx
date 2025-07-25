import { NodeProvider } from "@dataflow-ui/contexts/NodeContext";
import AppContainer from "./AppContainer";
import { UserGraphProvider } from "@dataflow-ui/contexts/UserGraphContext";
import ErrorBoundary from "./ErrorBoundary";
import { GraphProvider } from "@dataflow-ui/contexts/GraphContext";
import { DataflowProvider } from "@dataflow-ui/contexts/DataflowContext";
import { DashboardProvider } from "@dataflow-ui/contexts/DashboardContext";
import { RealTimeProvider } from "@dataflow-ui/contexts/RealTimeContext";
import { AppConfig } from "@dataflow-ide/dataflow-core";

interface DataflowProps {
    loadGraph?: (graphId: string) => Promise<AppConfig | undefined>;
    saveGraph?: (graph: AppConfig) => Promise<Response>;
    deleteGraph?: (graphId: string) => Promise<Response>;
    listGraphs?: () => Promise<AppConfig[]>;
}

export default function Dataflow({ listGraphs, loadGraph, saveGraph, deleteGraph }: DataflowProps) {
    return (
        <ErrorBoundary>
            <DataflowProvider>
                <RealTimeProvider url={process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL}>
                    <UserGraphProvider remoteListGraphs={listGraphs} remoteLoadGraph={loadGraph} remoteSaveGraph={saveGraph} remoteDeleteGraph={deleteGraph}>
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
