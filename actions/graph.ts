'use server'

import { AppConfig } from "@/components/config/Schema";
import { buildExecutionGraph, resolveExecutionGraph, ExecutionGraph } from "@/engine/graph";

export async function getExecutionGraph(graph: AppConfig): Promise<ExecutionGraph | undefined> {
    return buildExecutionGraph(graph);
}

export async function resolveGraph(graph: AppConfig): Promise<ExecutionGraph | undefined> {
    const executionGraph = buildExecutionGraph(graph);
    return executionGraph ? resolveExecutionGraph(executionGraph) : undefined;
}
