import { NextRequest, NextResponse } from "next/server";
import { executeGraph } from "@/actions/graph";

export async function POST(req: NextRequest) {
    const { graph, params, clientSocketId } = await req.json();
    let result = undefined;
    let status = 200;

    try {
        if (!clientSocketId) {
            throw new Error("Client Socket ID is missing for remote execution");
        }

        result = await executeGraph(graph, params, clientSocketId);
        
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
