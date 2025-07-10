import React from "react";
import { Coordinates, NodeConfig, NodeType } from "@dataflow-ide/dataflow-core";

export type NodeTemplateBuilder = (node: NodeConfig) => React.ReactElement;

export interface DefaultNodeConfig extends Omit<NodeConfig, "id" | "position"> {
    position?: Coordinates;
}

interface NodeTemplate {
    builder: NodeTemplateBuilder;
    config: DefaultNodeConfig;
}

const registry: Map<NodeType, NodeTemplate> = new Map();

export default registry;
