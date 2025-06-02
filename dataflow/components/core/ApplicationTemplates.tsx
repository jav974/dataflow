import React from "react";
import { NodeConfig } from "../../config/schema";
import ErrorBoundary from "./ErrorBoundary";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import NodeWrapper from "./NodeWrapper";
import registry from "../nodes/registry";
import { Signal, useComputed } from "@preact/signals-react";
import "../nodes/NodeTemplates"

export default function ApplicationTemplates() {
    const { nodes } = useGraphContext();
    const templates = useComputed(() => nodes.value.map((_node: Signal<NodeConfig>): React.ReactElement => {
        const node = _node.value;
        const reactElementBuilder = registry.get(node.type)?.builder;

        if (!reactElementBuilder) {
            console.log(`Unknown type ${node.type}`);
            
            return (
                <NodeWrapper nodeId={node.id} key={node.id}>
                    <div className="unknown-node">
                        <span>Unknown Node Type: {node.type}</span>
                    </div>
                </NodeWrapper>
            );
        }

        return (
            <NodeWrapper nodeId={node.id} key={node.id}>
                {reactElementBuilder(_node)}
            </NodeWrapper>
        );
    }));

    return (
        <ErrorBoundary>
            <div id="html-layouts" className="hidden">
                {templates.value}
            </div>
        </ErrorBoundary>
    );
}
