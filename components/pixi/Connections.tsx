import { useGraphContext } from '@/contexts/GraphContext';
import { ConnectionConfig } from '../config/Schema';
import Connection from './Connection';

export default function Connections() {
    const { name, connections } = useGraphContext();

    return (
        <>
            {connections.ref.current.map((c: ConnectionConfig) =>
                <Connection key={`${name}_{${c.from.id}-${c.from.pin}-${c.to.id}-${c.to.pin}`} from={c.from} to={c.to} />
            )}
        </>
    );
}
