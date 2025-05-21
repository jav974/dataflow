import React, { useEffect, useState } from "react";
import { NodeConfig } from "../config/Schema";
import ErrorBoundary from "./ErrorBoundary";
import { useGraphContext } from "@/contexts/GraphContext";
import NodeWrapper from "./NodeWrapper";
import registry from "../nodes/registry";
import "../nodes/NodeTemplates"

export default function ApplicationTemplates() {
    const { nodes } = useGraphContext();
    const [templates, setTemplates] = useState<React.ReactElement[]>([]);

    useEffect(() => {
        const _templates = nodes.ref.current.map((node: NodeConfig): React.ReactElement => {
            const reactElementBuilder = registry.get(node.type)?.builder;

            if (!reactElementBuilder) {
                console.log(`Unknown type ${node.type}`);
                return <NodeWrapper nodeId={node.id} key={node.id} />
            }

            return (
                <NodeWrapper nodeId={node.id} key={node.id}>
                    {reactElementBuilder(node)}
                </NodeWrapper>
            );
        }) ?? [];

        setTemplates(_templates);
    }, [nodes.lastUpdated]);

    return <ErrorBoundary>
        <div id="html-layouts" className="hidden">
            {templates}
        </div>
    </ErrorBoundary>;
}
