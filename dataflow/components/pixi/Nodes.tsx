import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { useRefSignalRender } from "react-refsignal";
import HtmlNode from "./HtmlNode";

export default function Nodes() {
    const { name, nodes } = useGraphContext();

    useRefSignalRender([nodes]);

    return (
        <>
            {nodes.current.map((nodeSignal) =>
                <HtmlNode key={`${name}_${nodeSignal.current.id}`} node={nodeSignal.current} />
            )}
        </>
    );
}
