import { RefSignal, useRefSignalMemo } from "react-refsignal";
import { useGraphContext } from "../contexts/GraphContext";
import { NodeConfig } from "@dataflow-ide/dataflow-core";

export default function useObservableNode(nodeId: string): RefSignal<RefSignal<NodeConfig> | undefined> {
    const { nodes } = useGraphContext();
    
    return useRefSignalMemo(() => nodes.current.find(node => node.current.id === nodeId), [nodes, nodeId]);
}
