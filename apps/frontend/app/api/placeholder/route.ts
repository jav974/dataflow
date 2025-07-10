import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        id: 1,
        title: "First",
        description: "Lol",
        children: [{
            id: 54,
            age: 45
        }, {
            id: 57,
            age: 12
        }]
    });
}
