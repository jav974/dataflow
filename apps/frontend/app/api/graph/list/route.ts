import { NextResponse } from 'next/server';
import { AppConfigModel, dbConnect, dehydrateAppConfig } from '@dataflow-ide/dataflow-backend';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/authOptions';

export async function GET() {
    await dbConnect();
    const session = await getServerSession(authOptions);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let configs: any[] = [];

    if (!session) {
        configs = await AppConfigModel.find({ userId: "demo" });
    } else {
        configs = await AppConfigModel.find({ userId: session.user.id });
    }
    
    const plainConfigs = configs.map(config => dehydrateAppConfig(config.toObject()));

    return NextResponse.json(plainConfigs);
}
