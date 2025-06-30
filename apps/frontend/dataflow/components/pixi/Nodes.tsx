import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { useRefSignalRender } from "react-refsignal";
import HtmlNode from "./HtmlNode";

export default function Nodes() {
    const { id, nodes } = useGraphContext();

    useRefSignalRender([nodes]);

    return (
        <>
            {nodes.current.map((nodeSignal) =>
                <HtmlNode key={`${id.current}_${nodeSignal.current.id}`} node={nodeSignal.current} />
            )}
        </>
    );
}
