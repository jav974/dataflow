import Node, { NodeProps } from "@/dataflow/components/core/Node";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { jsonToMap } from "@/dataflow/engine/utils";
import { useComputed, useSignalEffect } from "@preact/signals-react";
import React, { useCallback, useState } from "react";

interface GetVarNodeProps extends NodeProps {
}

export default function GetVarNode({node}: GetVarNodeProps) {
    const {variables, setNodeContext, updateNodeOutput} = useGraphContext();
    const [hasError, setHasError] = useState<boolean>(false);
    const context = useComputed(() => jsonToMap<any>(node.value.context));
    const contextVar = useComputed(() => context.value?.get('var'));
    const variable = useComputed(() => {
        if (!contextVar.value) return undefined;
        const v = variables.value.find(v => v.value.id === contextVar.value);
        return v ? {...v.value} : undefined;
    });

    const options = useComputed((): React.ReactElement[] => {
        const result: React.ReactElement[] = [];
        let found: boolean = contextVar.value === undefined ? true : false;

        variables.value.forEach((_variable) => {
            const variable = _variable.value;
            result.push(<option key={variable.id} value={variable.id}>{variable.name}</option>);

            if (variable.id === contextVar.value) {
                found = true;
            }
        });

        if (!found) {
            result.push(<option key={contextVar.value} value={contextVar.value} disabled>[Removed var]</option>);
            setHasError(true);
        } else {
            setHasError(false);
        }

        return result;
    });

    // If no var already selected, pick the first one
    useSignalEffect(() => {
        if (!contextVar.value) {
            setNodeContext(node.value.id, (new Map(context.value)).set('var', variables.value[0].value.id));
        }
    });

    // Update the node output var type based on variable
    useSignalEffect(() => {
        if (variable.value && node.value.outputs && node.value.outputs.length > 0) {
            const output = node.value.outputs[0];

            if (output.type !== variable.value.type || output.isCollection !== variable.value.isCollection) {
                updateNodeOutput(node.value.id, {id: node.value.outputs[0].id, type: variable.value.type, isCollection: variable.value.isCollection});
            }
        }
    });

    const onChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setNodeContext(node.value.id, (new Map(context.value)).set('var', e.target.value));
    }, [node.value.id, context.value, setNodeContext]);

    return (
        <Node
            node={node}
            hasContinue={false}
            hasExecute={false}
            size={{width: 150, height: 50}}
        >
            <div>
                <select value={contextVar.value} onChange={onChange} className="p-1 bg-gray-700 w-full outline outline-blue-500/50 focus:outline-blue-500">
                    {options}
                </select>

                {hasError && <p className="text-red-500 text-md text-center mt-1">Var not found</p>}
            </div>
        </Node>
    );
}
