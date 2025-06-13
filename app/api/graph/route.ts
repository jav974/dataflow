import { NextRequest, NextResponse } from "next/server";
import { executeGraph } from "@/actions/graph";

export async function POST(req: NextRequest) {
    const { graph, params } = await req.json();
    const result = await executeGraph(graph, params);
    
    // Removes circular dependencies by removing the graph itself.
    if (result) {
        result.graph = undefined;
    }

    return NextResponse.json(result);
}
