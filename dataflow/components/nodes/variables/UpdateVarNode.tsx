import useKnownVars from "@/dataflow/hooks/useKnownVars";
import Node, { NodeProps } from "../../core/Node";
import { useRefSignalRender } from "react-refsignal";
import { useCallback, useEffect, useMemo } from "react";
import { jsonToMap } from "@/dataflow/engine/utils";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";

export default function UpdateVarNode({node, ...props}: NodeProps) {
    const { setNodeContext, setNodeInputs, setNodeOutputs, variables } = useGraphContext();
    const options = useKnownVars();
    const context = useMemo(() => jsonToMap<string>(node.context), [node.context]);
    const contextVar = useMemo(() => context.get('var'), [context]);
    // const input = useMemo(() => node.inputs ? node.inputs[0] : undefined, [node.inputs]);
    // const output = useMemo(() => node.outputs ? node.outputs[0] : undefined, [node.outputs]);

    useRefSignalRender([options, variables]);

    const updateVariable = useCallback((id: string) => {
        const variable = variables.current.find(v => v.id === id);
        if (!variable) return ;

        setNodeContext(node.id, context.set('var', variable.id));
        setNodeInputs(node.id, [{
            id: "value",
            name: "value",
            required: true,
            type: variable.type,
            isCollection: variable.isCollection,
        }]);
        setNodeOutputs(node.id, [{
            id: "result",
            name: "result",
            type: variable.type,
            isCollection: variable.isCollection
        }])
    }, [setNodeContext, setNodeInputs, setNodeOutputs, node.id]);

    const onChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        updateVariable(e.target.value);
    }, [updateVariable]);

    useEffect(() => {
        if (!contextVar && variables.current.length > 0) {
            updateVariable(variables.current[0].id);
        }
    }, [contextVar, variables, updateVariable]);

    return (
        <Node
            node={node}
            size={{width: 200, height: 100}}
            hasExecute={true}
            hasContinue={true}
            {...props}
        >
            <div>
                <select value={contextVar} onChange={onChange} className="p-1 bg-gray-700 w-full outline outline-blue-500/50 focus:outline-blue-500">
                    {options.current}
                </select>
            </div>
        </Node>
    );
}