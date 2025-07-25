import { authOptions } from "@/lib/authOptions";
import { AppConfigModel, dbConnect } from "@dataflow-ide/dataflow-backend";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const config = await AppConfigModel.findOneAndDelete({ id, userId: session.user.id });
    if (!config) return NextResponse.json({ error: 'Config not found' }, { status: 404 });

    return NextResponse.json({success: true});
}
