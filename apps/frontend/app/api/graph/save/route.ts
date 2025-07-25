import { NextResponse } from 'next/server';
import { hydrateAppConfig, AppConfigModel, dbConnect, dehydrateAppConfig } from '@dataflow-ide/dataflow-backend';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/authOptions';

export async function POST(req: Request) {
    await dbConnect();
    
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const hydrated = hydrateAppConfig(body);
    const dehydrated = dehydrateAppConfig(hydrated);

    const saved = await AppConfigModel.findOneAndUpdate(
        { id: hydrated.id },
        {...dehydrated, userId: session.user.id},
        { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: saved });
}
