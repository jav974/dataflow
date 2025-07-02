'use server'

import { AppConfig } from "@dataflow-core/config/schema";
import { KeyValue } from "@dataflow-core/engine/context";
import { buildExecutionGraph, runGraph } from "@dataflow-core/engine/graph";
import { ExecutionGraph, GraphResult } from "@dataflow-core/engine/types";

export async function getExecutionGraph(graph: AppConfig): Promise<ExecutionGraph | undefined> {
    return buildExecutionGraph(graph);
}

export async function executeGraph(graph: AppConfig, params?: KeyValue, clientSocketId?: string): Promise<GraphResult | undefined> {
    return runGraph(graph, params, clientSocketId);
}
