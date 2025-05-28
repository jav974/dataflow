import { useGraphContext } from '@/contexts/GraphContext';
import { ConnectionConfig } from '../config/Schema';
import Connection from './Connection';

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
