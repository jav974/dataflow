import { NextResponse } from 'next/server';
import { dehydrateAppConfig, AppConfigModel, dbConnect, AppConfigClass } from '@dataflow-ide/dataflow-backend';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(req: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const config = await AppConfigModel.findOne({ id, userId: session.user.id });
    if (!config) return NextResponse.json({ error: 'Config not found' }, { status: 404 });

    const instance = Object.assign(new AppConfigClass(), config.toObject());

    return NextResponse.json(dehydrateAppConfig(instance));
}
