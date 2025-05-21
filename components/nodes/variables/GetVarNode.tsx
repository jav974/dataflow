import { ParameterType } from "@/components/config/Schema";
import Node, { NodeProps } from "@/components/core/Node";
import { useGraphContext } from "@/contexts/GraphContext";
import React, { useCallback, useEffect, useState } from "react";

interface GetVarNodeProps extends NodeProps {
}

export default function GetVarNode({node, context}: GetVarNodeProps) {
    const {addNodeOutput, variables, setNodeContext} = useGraphContext();
    const [variableName, setVariableName] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!node.outputs) {
            addNodeOutput(node.id, {
                id: "value",
                name: "value",
                type: ParameterType.ANY
            });
        }
    }, [node.id, node.outputs, addNodeOutput]);

    useEffect(() => {
        setVariableName(context?.get('var'));
    }, [context]);

    const onChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setVariableName(e.target.value);
        setNodeContext(node.id, (new Map(context)).set('var', e.target.value));
    }, [node.id, context, setNodeContext]);

    return (
        <Node
            node={node}
            hasContinue={false}
            hasExecute={false}
            size={{width: 150, height: 50}}
        >
            <div>
                <select value={variableName} onChange={onChange} className="p-1 bg-gray-700 outline outline-blue-500/50 focus:outline-blue-500">
                    {Array.from(variables.ref.current.values()).map((name, index) => <option key={index} value={name}>{name}</option>)}
                </select>
            </div>
        </Node>
    );
}
