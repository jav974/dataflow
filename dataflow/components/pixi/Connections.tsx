import { useGraphContext } from '@/dataflow/contexts/GraphContext';
import { ConnectionConfig } from '../../config/schema';
import Connection from './Connection';
import { useRefSignalRender } from 'react-refsignal';

export default function Connections() {
    const { name, connections } = useGraphContext();

    useRefSignalRender([connections]);

    return (
        <>
            {connections.current.map((c: ConnectionConfig) =>
                <Connection key={`${name}_{${c.from.id}-${c.from.pin}-${c.to.id}-${c.to.pin}`} from={c.from} to={c.to} />
            )}
        </>
    );
}
