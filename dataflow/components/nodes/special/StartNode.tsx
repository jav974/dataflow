import { OutputConfig } from "@/dataflow/config/schema";
import Node, { NodeProps } from "@/dataflow/components/core/Node";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { useEffect, useRef } from "react";

interface StartNodeProps extends NodeProps {
}

export default function StartNode({node}: StartNodeProps) {
    const {setVariable, removeVariable} = useGraphContext();
    const outputs = useRef<OutputConfig[]>([...node.outputs ?? []]);

    useEffect(() => {
        node.outputs?.forEach((output: OutputConfig) => {
            setVariable(output.id, output.name, output.type, output.isCollection ?? false);
        });

        outputs.current.forEach((output: OutputConfig) => {
            if (!node.outputs?.find(o => o.id === output.id)) {
                removeVariable(output.id);
            }
        });

        outputs.current = [...node.outputs ?? []];
    }, [node.outputs]);

    return (
        <Node
            node={node}
            hasExecute={false}
            hasContinue={true}
            size={{width: 200, height: 100}}
            outputMultiple={true}
        />
    );
}
