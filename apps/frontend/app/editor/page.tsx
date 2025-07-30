'use client'

import { AppConfig } from '@dataflow-ide/dataflow-core';
import Dataflow from '@dataflow-ide/dataflow-ui';
import { useSession } from 'next-auth/react';

async function saveToMongo(config: AppConfig): Promise<Response> {
    return await fetch('/api/graph/save', {
        method: 'POST',
        body: JSON.stringify(config),
        headers: { 'Content-Type': 'application/json' }
    });
}

async function loadFromMongo(id: string): Promise<AppConfig | undefined> {
    const res = await fetch(`/api/graph/load?id=${id}`);
    if (!res.ok) return undefined;
    return await res.json();
}

async function deleteFromMongo(id: string): Promise<Response> {
    return await fetch(`/api/graph/delete?id=${id}`, {method: 'DELETE'});
}

async function listFromMongo(): Promise<AppConfig[]> {
    const res = await fetch('/api/graph/list');
    if (!res.ok) return [];
    return await res.json();
}

export default function Page() {
    const {data} = useSession();
    const isLoggedIn = data && data.user && data.user.id;

    return (
        <Dataflow
            listGraphs={listFromMongo}
            loadGraph={loadFromMongo}
            saveGraph={isLoggedIn ? saveToMongo : undefined}
            deleteGraph={isLoggedIn ? deleteFromMongo : undefined} />
    );
}
