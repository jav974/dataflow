import Node, { NodeProps } from "@/components/core/Node";
import { useGraphContext } from "@/contexts/GraphContext";
import React, { useCallback, useEffect, useMemo } from "react";

interface GetVarNodeProps extends NodeProps {
}

export default function GetVarNode({node, context}: GetVarNodeProps) {
    const {variables, setNodeContext} = useGraphContext();
    const options = useMemo((): React.ReactElement[] => {
        const result: React.ReactElement[] = [];

        variables.ref.current.forEach((name, index) => result.push(
            <option key={index} value={index}>{name}</option>
        ));

        return result;
    }, [variables.lastUpdated]);

    useEffect(() => {
        if (!context?.get('var')) {
            setNodeContext(node.id, (new Map(context)).set('var', variables.ref.current.keys().next().value));
        }
    }, [node.id, context, setNodeContext]);

    const onChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
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
                <select value={context?.get('var')} onChange={onChange} className="p-1 bg-gray-700 outline outline-blue-500/50 focus:outline-blue-500">
                    {options}
                </select>
            </div>
        </Node>
    );
}
