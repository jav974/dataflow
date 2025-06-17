import Node, { NodeProps } from "@/dataflow/components/core/Node";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { jsonToMap } from "@/dataflow/engine/utils";
import { useRefSignalRender } from "react-refsignal";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export default function GetVarNode({node}: NodeProps) {
    const {variables, setNodeContext, updateNodeOutput} = useGraphContext();
    const [hasError, setHasError] = useState<boolean>(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context = useMemo(() => jsonToMap<any>(node.context), [node.context]);
    const contextVar = useMemo(() => {
        return context?.get('var');
    }, [context]);
    const lastUpdated = variables.lastUpdated;
    const variable = useMemo(() => {
        void lastUpdated;
        if (!contextVar) return undefined;
        const v = variables.current.find(v => v.id === contextVar);
        return v ? {...v} : undefined;
    }, [variables, lastUpdated, contextVar]);

    const options = useMemo((): React.ReactElement[] => {
        void lastUpdated;
        const result: React.ReactElement[] = [];
        let found: boolean = contextVar === undefined ? true : false;

        variables.current.forEach((variable) => {
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
    }, [variables, lastUpdated, contextVar]);

    useEffect(() => {
        if (!context?.get('var')) {
            setNodeContext(node.id, (new Map(context)).set('var', variables.current[0]?.id));
        }
    }, [node.id, context, setNodeContext, variables]);

    useEffect(() => {
        if (variable && node.outputs && node.outputs.length > 0) {
            updateNodeOutput(node.id, {id: node.outputs[0].id, type: variable.type, isCollection: variable.isCollection});
        }
    }, [node.id, node.outputs, variable, updateNodeOutput]);

    const onChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setNodeContext(node.id, (new Map(context)).set('var', e.target.value));
    }, [node.id, context, setNodeContext]);

    useRefSignalRender([variables]);

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
