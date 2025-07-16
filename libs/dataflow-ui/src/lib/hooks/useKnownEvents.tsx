import { RefSignal, useRefSignal, useRefSignalEffect, useRefSignalMemo } from "react-refsignal";
import { useGraphContext } from "../contexts/GraphContext";
import { jsonToMap, NodeConfig, NodeType } from "@dataflow-ide/dataflow-core";
import { useCallback } from "react";
import { OptionProps } from "@dataflow-ui/components/forms/Select";

export interface KnownEvents extends OptionProps {
    nodeSignal: RefSignal<NodeConfig>;
}

export default function useKnownEvents(): RefSignal<KnownEvents[]> {
    const { nodes } = useGraphContext();
    const eventNodes = useRefSignal<RefSignal<NodeConfig>[]>([]);
    const options = useRefSignalMemo(() => {
        const result: KnownEvents[] = [];
        eventNodes.current.forEach(node => {
            const eventName = jsonToMap<string>(node.current.context).get('name');

            if (eventName) {
                result.push({name: eventName, value: node.current.id, nodeSignal: node});
            }
        });

        return result;
    }, [eventNodes]);

    const onEventNodeUpdated = useCallback(() => {
        eventNodes.notifyUpdate();
    }, []);

    useRefSignalEffect(() => {
        eventNodes.current.forEach(nodeSignal => nodeSignal.unsubscribe(onEventNodeUpdated));
        eventNodes.current = [];

        nodes.current.filter(node => node.current.type === NodeType.NEW_EVENT).forEach((node) => {
            node.subscribe(onEventNodeUpdated);
            eventNodes.current.push(node);
        });

        eventNodes.notifyUpdate();
    }, [nodes]);

    return options;
}
