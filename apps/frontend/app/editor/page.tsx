'use client'

import Dataflow from '@dataflow-ide/dataflow-ui';

export default function Page() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    return (
        <Dataflow serverUrl={`${baseUrl}/api/graph`}/>
    );
}
