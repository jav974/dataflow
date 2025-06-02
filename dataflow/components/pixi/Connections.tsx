import { useGraphContext } from '@/dataflow/contexts/GraphContext';
import { ConnectionConfig } from '../../config/schema';
import Connection from './Connection';
import { Signal, useSignalEffect } from '@preact/signals-react';
import React, { useState } from 'react';

export default function Connections() {
    const { name, connections } = useGraphContext();
    const [connectionComponents, setConnectionComponents] = useState<React.ReactElement[]>([]);

    useSignalEffect(() => {
        setConnectionComponents(connections.value.map((c: Signal<ConnectionConfig>) =>
            <Connection key={`${name}_{${c.value.from.id}-${c.value.from.pin}-${c.value.to.id}-${c.value.to.pin}`} from={c.value.from} to={c.value.to} />
        ));
    });

    return (
        <>
            {connectionComponents}
        </>
    );
}
