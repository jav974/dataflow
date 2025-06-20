import { RefSignal, useRefSignalEffect, useRefSignalMemo } from "react-refsignal";
import { ConnectionInfo, useGraphContext } from "../contexts/GraphContext";

export default function useObservableInput(nodeId: string, inputId: string): RefSignal<ConnectionInfo | undefined> {
    const { nodes, connections, getConnectionInfo } = useGraphContext();

    // Track node and input
    const node = useRefSignalMemo(() => nodes.current.find(node => node.current.id === nodeId), [nodes, nodeId]);
    const input = useRefSignalMemo(() => node.current?.current.inputs?.find(input => input.id === inputId), [node, inputId]);
    
    // Update connection when
    // - connections array gets notified (new or removed connection)
    // - node or input gets notified
    const connectionInfo = useRefSignalMemo<ConnectionInfo | undefined>(() => {
        if (!input.current) return undefined;
        return getConnectionInfo(nodeId, input.current);
    }, [connections, input, node]);

    // Track connected node when connectionInfo updates
    const connectedNode = useRefSignalMemo(() => connectionInfo.current?.node, [connectionInfo]);

    // Notify input when connectedNode or its underlying node signal updates
    useRefSignalEffect(() => {
        if (input.current) input.notify();
    }, [connectedNode, connectedNode.current]);

    return connectionInfo;
}
