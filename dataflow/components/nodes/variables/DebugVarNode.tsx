import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import Node, { NodeProps } from "../../core/Node";
import { useMemo } from "react";

interface DebugVarNodeProps extends NodeProps {
}

export default function DebugVarNode({node}: DebugVarNodeProps) {
    const {computedResult} = useGraphContext();

    const executionValue = useMemo((): any => {
        const inputId = node.inputs ? node.inputs[0].id : '';
        return computedResult.current.get(node.id + ':' + inputId);
    }, [computedResult.lastUpdated, node]);

    return (
        <Node
            node={node}
            hasContinue={true}
            hasExecute={true}
            size={{width: 150, height: 100}}
        >
            {computedResult.current.size > 0 &&
            <pre className="text-lg bg-gray-900" style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {JSON.stringify(executionValue, null, 2)}
            </pre>
            }
        </Node>
    );
}
