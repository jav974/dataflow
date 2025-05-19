import { NodeType, ParameterType } from "@/components/config/Schema";
import Node, { NodeProps } from "@/components/core/Node";
import { useGraphContext } from "@/contexts/GraphContext";
import React, { useCallback, useEffect, useState } from "react";

interface GetVarNodeProps extends Omit<NodeProps, "type" | "executable"> {
}

export default function GetVarNode({id, position, outputs}: GetVarNodeProps) {
    const {addNodeOutput, variables} = useGraphContext();
    const [variableName, setVariableName] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!outputs) {
            addNodeOutput(id, {
                id: "value",
                name: "value",
                type: ParameterType.ANY
            });
        }
    }, [id, outputs, addNodeOutput]);

    const onChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setVariableName(e.target.value);
    }, []);

    return (
        <Node
            id={id}
            type={NodeType.GET}
            name="get"
            position={position}
            executable={false}
            hasContinue={false}
            hasExecute={false}
            outputs={outputs}
            size={{width: 150, height: 50}}
        >
            <div>
                <select value={variableName} onChange={onChange} className="p-1 bg-gray-700 outline outline-blue-500/50 focus:outline-blue-500">
                    {variables.map((name, index) => <option key={index} value={name}>{name}</option>)}
                </select>
            </div>
        </Node>
    );
}
