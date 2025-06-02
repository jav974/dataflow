import React from "react";
import { Coordinates, NodeConfig, NodeType } from "../../config/schema";
import { Signal } from "@preact/signals-react";

export type NodeTemplateBuilder = (node: Signal<NodeConfig>) => React.ReactElement;

export interface DefaultNodeConfig extends Omit<NodeConfig, "id" | "position"> {
    position?: Coordinates;
}

interface NodeTemplate {
    builder: NodeTemplateBuilder;
    config: DefaultNodeConfig;
}

const registry: Map<NodeType, NodeTemplate> = new Map();

export default registry;
