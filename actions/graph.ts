'use server'

import { AppConfig } from "@/components/config/Schema";
import { buildExecutionGraph, ExecutionGraph, runGraph, GraphResult } from "@/engine/graph";

export async function getExecutionGraph(graph: AppConfig): Promise<ExecutionGraph | undefined> {
    return buildExecutionGraph(graph);
}

export async function executeGraph(graph: AppConfig): Promise<GraphResult | undefined> {
    return runGraph(graph, {});
}
