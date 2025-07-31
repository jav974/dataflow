import { instanceToPlain } from 'class-transformer';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI!;

export async function dbConnect(uri: string = MONGO_URI): Promise<void> {
    if (mongoose.connection.readyState >= 1) return;

    try {
        await mongoose.connect(uri, {
            dbName: 'dataflow',
            authSource: 'admin',
        });
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ DB connection failed:', error);
        throw error;
    }
}

export function stripMongoArtifacts(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(stripMongoArtifacts);
    } else if (obj && typeof obj === 'object') {
        const { _id, __v, ...rest } = obj;
        for (const key in rest) {
            rest[key] = stripMongoArtifacts(rest[key]);
        }
        return rest;
    }
    return obj;
}

export function dehydrate<T, U>(instance: T): U {
    return stripMongoArtifacts(instanceToPlain(instance)) as U;
}
