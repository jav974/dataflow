import { NodePositionUpdateEvent, NodeUpdateEvent } from "@dataflow-ide/dataflow-core";
import { useEvent, useEventState } from "./useEvent";

export default function useLastUpdatedState(name: string): number | null | undefined {
    return useEventState<number>(name);
}

export function useNodeLastUpdatedState(nodeId: string): number | null | undefined {
    return useLastUpdatedState(NodeUpdateEvent(nodeId));
}

export function useNodePositionLastUpdatedState(nodeId: string): number | null | undefined {
    return useLastUpdatedState(NodePositionUpdateEvent(nodeId));
}

export function useNodeLastUpdatedEvent(nodeId: string, listener: (updatedAt: number) => void) {
    useEvent<number>(NodeUpdateEvent(nodeId), listener)
}
