import Node, { NodeProps } from "@/dataflow/components/core/Node";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface GetVarNodeProps extends NodeProps {
}

export default function GetVarNode({node, context}: GetVarNodeProps) {
    const {variables, setNodeContext, updateNodeOutput} = useGraphContext();
    const [hasError, setHasError] = useState<boolean>(false);
    const contextVar = useMemo(() => {
        return context?.get('var');
    }, [context]);
    const variable = useMemo(() => {
        if (!contextVar) return undefined;
        const v = variables.ref.current.find(v => v.id === contextVar);
        return v ? {...v} : undefined;
    }, [variables.lastUpdated, contextVar]);

    const options = useMemo((): React.ReactElement[] => {
        const result: React.ReactElement[] = [];
        let found: boolean = contextVar === undefined ? true : false;

        variables.ref.current.forEach((variable) => {
            result.push(<option key={variable.id} value={variable.id}>{variable.name}</option>);

            if (variable.id === contextVar) {
                found = true;
            }
        });

        if (!found) {
            result.push(<option key={contextVar} value={contextVar} disabled>[Removed var]</option>);
            setHasError(true);
        } else {
            setHasError(false);
        }

        return result;
    }, [variables.lastUpdated, contextVar]);

    useEffect(() => {
        if (!context?.get('var')) {
            setNodeContext(node.id, (new Map(context)).set('var', variables.ref.current[0].id));
        }
    }, [node.id, context, setNodeContext]);

    useEffect(() => {
        if (variable && node.outputs && node.outputs.length > 0) {
            updateNodeOutput(node.id, {id: node.outputs[0].id, type: variable.type, isCollection: variable.isCollection});
        }
    }, [node.id, variable]);

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
                <select value={contextVar} onChange={onChange} className="p-1 bg-gray-700 w-full outline outline-blue-500/50 focus:outline-blue-500">
                    {options}
                </select>

                {hasError && <p className="text-red-500 text-md text-center mt-1">Var not found</p>}
            </div>
        </Node>
    );
}
