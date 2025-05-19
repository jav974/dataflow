import { NodeProvider } from "@/contexts/NodeContext";
import AppContainer from "./AppContainer";
import { UserGraphProvider } from "@/contexts/UserGraphContext";
import ErrorBoundary from "./ErrorBoundary";
import { GraphProvider } from "@/contexts/GraphContext";

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
