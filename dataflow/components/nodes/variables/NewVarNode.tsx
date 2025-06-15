import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { NodeProps } from "../../core/Node";
import SetVarNode from "./SetVarNode";
import { useRefSignalEffect, useRefSignalMemo } from "react-refsignal";
import { ParameterTypes } from "@/dataflow/config/schema";
import { jsonToMap } from "@/dataflow/engine/utils";

interface NewVarNodeProps extends NodeProps {
}

export default function NewVarNode({node}: NewVarNodeProps) {
    const {variables, updateNodeInput, setNodeContext} = useGraphContext();
    const variable = useRefSignalMemo(() =>
        variables.current.find((n) => n.id === node.id),
        [variables]
    );

    useRefSignalEffect(() => {
        const _var = variable.current;
        if (!_var) return ;
        const input = node.inputs ? node.inputs[0] : undefined;
        if (!input) return ;
        const primitives = [ParameterTypes.BOOLEAN, ParameterTypes.NUMBER, ParameterTypes.STRING] as string[];

        if (_var.isCollection || !primitives.includes(_var.type)) {
            if (input.editable) {
                updateNodeInput(node.id, {...input, editable: false, defaultValue: undefined});
            }
        } else {
            if (!input.editable) {
                updateNodeInput(node.id, {...input, editable: true});
            }
        }

        const context = jsonToMap(node.context);

        if (context.get('_type') !== _var.type || context.get('_isCollection') !== _var.isCollection) {
            setNodeContext(node.id, context.set('_type', _var.type).set('_isCollection', _var.isCollection));
        }
    }, [variable, node]);

    return (
        <SetVarNode
            node={node}
        />
    );
}
