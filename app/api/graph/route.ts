import { NextRequest, NextResponse } from "next/server";
import { executeGraph } from "@/actions/graph";
import controller from "@/dataflow/engine/controller";

export async function POST(req: NextRequest) {
    const { graph, params } = await req.json();
    let result = undefined;
    let status = 200;

    try {
        result = await controller.start(executeGraph, graph, params);
        
        // Removes circular dependencies by removing the graph itself.
        if (result) {
            result.graph = undefined;
        }
    } catch (error) {
        result = {message: (error as Error).message} as Error;
        status = result.message === "Execution canceled" ? 499 : 500;
    }

    return NextResponse.json(result, {status});
}
