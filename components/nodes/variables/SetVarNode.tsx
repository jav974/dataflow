import { useGraphContext } from "@/contexts/GraphContext";
import Node, { NodeProps } from "../../core/Node";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { ParameterType } from "../../config/Schema";
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

interface SetVarNodeProps extends NodeProps {
}

export default function SetVarNode({node}: SetVarNodeProps) {
    const {addNodeInput, addNodeOutput, setVariable, variables, setNodeContext} = useGraphContext();
    const formRef = useRef<HTMLFormElement | null>(null);
    const schema = useMemo(() => yup.object({name: yup.string().required()}), []);
    const {register, handleSubmit, formState: { errors }} = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: variables.ref.current.get(node.id) ?? ""
        }
    });
    const onSubmit = useCallback((data: any, event?: React.BaseSyntheticEvent) => {
        event?.preventDefault();
        setVariable(node.id, data.name);
        setNodeContext(node.id, (new Map()).set('var', data.name));
    }, [node.id, setVariable, setNodeContext]);

    const onBlur = useCallback(() => {
        formRef.current?.requestSubmit();
    }, []);

    useEffect(() => {
        if (!node.inputs) {
            addNodeInput(node.id, {
                id: "value",
                name: "value",
                required: true,
                type: ParameterType.ANY
            });
        }
    }, [node.id, node.inputs, addNodeInput]);

    useEffect(() => {
        if (!node.outputs) {
            addNodeOutput(node.id, {
                id: "result",
                name: "result",
                type: ParameterType.ANY
            });
        }
    }, [node.id, node.outputs, addNodeOutput]);

    const inputClassName = errors["name"]
        ? "p-1 outline outline-red-500/50 focus:outline-red-500 max-h-[30px]"
        : "p-1 outline outline-blue-500/50 focus:outline-blue-500 max-h-[30px]";

    return (
        <Node
            node={node}
            hasExecute={true}
            hasContinue={true}
            size={{width: 100, height: 100}}
        >
            <form ref={formRef} className="p-2" onSubmit={handleSubmit(onSubmit)}>
                <input {...register('name')} className={inputClassName} placeholder="Variable name" onBlur={onBlur}></input>
            </form>
        </Node>
    );
}
