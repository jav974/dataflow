import React from "react";
import { NodeConfig } from "@dataflow-ide/dataflow-core";
import { RefSignal, useRefSignalRender } from "react-refsignal";

interface NodeTemplateWrapperProps {
    nodeSignal: RefSignal<NodeConfig>;
    nodeTemplate: (node: NodeConfig) => React.ReactNode;
}

export default function NodeTemplateWrapper({nodeSignal, nodeTemplate}: NodeTemplateWrapperProps) {
    useRefSignalRender([nodeSignal]);

    return nodeTemplate(nodeSignal.current);
}
