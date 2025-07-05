'use server'

import { AppConfig, buildExecutionGraph, ExecutionGraph, GraphResult, KeyValue, runGraph } from "@dataflow-ide/dataflow-core";

export async function getExecutionGraph(graph: AppConfig): Promise<ExecutionGraph | undefined> {
    return buildExecutionGraph(graph);
}

export async function executeGraph(graph: AppConfig, params?: KeyValue, clientSocketId?: string): Promise<GraphResult | undefined> {
    return runGraph(graph, params, clientSocketId);
}
