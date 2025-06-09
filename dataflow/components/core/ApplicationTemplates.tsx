import React, { useState } from "react";
import { NodeConfig } from "../../config/schema";
import ErrorBoundary from "./ErrorBoundary";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import NodeWrapper from "./NodeWrapper";
import registry from "../nodes/registry";
import "../nodes/NodeTemplates"
import { useRefSignalEffect } from "react-refsignal";

export default function ApplicationTemplates() {
    const { nodes } = useGraphContext();
    const [templates, setTemplates] = useState<React.ReactElement[]>([]);

    useRefSignalEffect(() => {
        const _templates = nodes.ref.current.map((node: NodeConfig): React.ReactElement => {
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
                    {reactElementBuilder(node)}
                </NodeWrapper>
            );
        }) ?? [];

        setTemplates(_templates);
    }, [nodes]);

    return (
        <ErrorBoundary>
            <div id="html-layouts" className="hidden">
                {templates}
            </div>
        </ErrorBoundary>
    );
}
