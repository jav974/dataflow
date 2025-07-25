import { NextResponse } from 'next/server';
import { AppConfigModel, dbConnect, dehydrateAppConfig } from '@dataflow-ide/dataflow-backend';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/authOptions';

export async function GET() {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const configs = await AppConfigModel.find({ userId: session.user.id });
    const plainConfigs = configs.map(config => dehydrateAppConfig(config.toObject()));

    console.log(plainConfigs);

    return NextResponse.json(plainConfigs);
}
