import { NextResponse } from 'next/server';
import { AppConfigModel, dbConnect } from '@dataflow-ide/dataflow-backend';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/authOptions';

export async function GET(req: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const params = searchParams.get('params') ? JSON.parse(searchParams.get('params') as string) : undefined;

    if (!id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const config = await AppConfigModel.findOne({ id, userId: session.user.id });

    if (!config) {
        return NextResponse.json({ error: "Config not found" }, { status: 404 });
    }

    try {
        const gatewayUrl = process.env.GATEWAY_URL;
        console.log("Gateway URL:", gatewayUrl);
        const result = await fetch(gatewayUrl + '/runner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ graph: id, params }),
        });
        const data = await result.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error during request:", error);
        return NextResponse.json({ error: "Failed to start sync" }, { status: 500 });
    }
}
