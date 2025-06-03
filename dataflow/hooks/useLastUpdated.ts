import { NodePositionUpdateEvent, NodeUpdateEvent } from "../events/events";
import { useEventState } from "./useEvent";

export default function useLastUpdated(name: string): number | null | undefined {
    return useEventState<number>(name);
}

export function useNodeLastUpdated(nodeId: string): number | null | undefined {
    return useLastUpdated(NodeUpdateEvent(nodeId));
}

export function useNodePositionLastUpdated(nodeId: string): number | null | undefined {
    return useLastUpdated(NodePositionUpdateEvent(nodeId));
}
