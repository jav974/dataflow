import React from "react";
import { NodeConfig, NodeType } from "../config/Schema";

export type NodeTemplateBuilder = (node: NodeConfig) => React.ReactElement;

const registry: Map<NodeType, NodeTemplateBuilder> = new Map();

export default registry;
