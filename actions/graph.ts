'use server'

import { AppConfig } from "@/dataflow/config/schema";
import { KeyValue } from "@/dataflow/engine/context";
import { buildExecutionGraph, runGraph } from "@/dataflow/engine/graph";
import { ExecutionGraph, GraphResult } from "@/dataflow/engine/types";

export async function getExecutionGraph(graph: AppConfig): Promise<ExecutionGraph | undefined> {
    return buildExecutionGraph(graph);
}

export async function executeGraph(graph: AppConfig, params?: KeyValue): Promise<GraphResult | undefined> {
    return runGraph(graph, params);
}
