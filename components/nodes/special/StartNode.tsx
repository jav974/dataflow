import { OutputConfig } from "@/components/config/Schema";
import Node, { NodeProps } from "@/components/core/Node";
import { useGraphContext } from "@/contexts/GraphContext";
import { useEffect, useRef } from "react";

interface StartNodeProps extends NodeProps {
}

export default function StartNode({node}: StartNodeProps) {
    const {variables} = useGraphContext();
    const outputs = useRef<OutputConfig[]>([...node.outputs ?? []]);

    useEffect(() => {
        node.outputs?.forEach((output: OutputConfig) => {
            variables.ref.current.set(output.id, output.name);
        });

        outputs.current.forEach((output: OutputConfig) => {
            if (!node.outputs?.includes(output)) {
                variables.ref.current.delete(output.id);
            }
        });

        variables.setLastUpdated(Date.now());

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
