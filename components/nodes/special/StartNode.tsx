import { OutputConfig } from "@/components/config/Schema";
import Node, { NodeProps } from "@/components/core/Node";
import { useGraphContext } from "@/contexts/GraphContext";
import { useEffect, useRef } from "react";

interface StartNodeProps extends NodeProps {
}

export default function StartNode({node}: StartNodeProps) {
    const {setVariable, removeVariable} = useGraphContext();
    const outputs = useRef<OutputConfig[]>([...node.outputs ?? []]);

    useEffect(() => {
        node.outputs?.forEach((output: OutputConfig) => {
            setVariable(output.id, output.name, output.type, false);
        });

        outputs.current.forEach((output: OutputConfig) => {
            if (!node.outputs?.includes(output)) {
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
