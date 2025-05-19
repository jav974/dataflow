import { useGraphContext } from '@/contexts/GraphContext';
import Connection from './Connection';
import { ConnectionConfig } from '../config/Schema';

export default function Connections() {
    const { connections } = useGraphContext();

    return (
        <>
            {connections.ref.current.map((c: ConnectionConfig) =>
                <Connection key={`${c.from.id}-${c.from.pin}-${c.to.id}-${c.to.pin}`} from={c.from} to={c.to} />
            )}
        </>
    );
}
