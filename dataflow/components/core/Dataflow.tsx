import { NodeProvider } from "@/dataflow/contexts/NodeContext";
import AppContainer from "./AppContainer";
import { UserGraphProvider } from "@/dataflow/contexts/UserGraphContext";
import ErrorBoundary from "./ErrorBoundary";
import { GraphProvider } from "@/dataflow/contexts/GraphContext";

export default function Dataflow() {
    return (
        <ErrorBoundary>
            <UserGraphProvider>
                <GraphProvider>
                    <NodeProvider>
                        <AppContainer />
                    </NodeProvider>
                </GraphProvider>
            </UserGraphProvider>
        </ErrorBoundary>
    );
}
