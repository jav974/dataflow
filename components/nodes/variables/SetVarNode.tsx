import { useGraphContext } from "@/contexts/GraphContext";
import Node, { NodeProps } from "../../core/Node";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { NodeType, ParameterType } from "../../config/Schema";
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

interface SetVarNodeProps extends Omit<NodeProps, "type"> {

}

export default function SetVarNode({id, position, inputs, outputs}: SetVarNodeProps) {
    const {addNodeInput, addNodeOutput, addVariable} = useGraphContext();
    const formRef = useRef<HTMLFormElement | null>(null);
    const schema = useMemo(() => yup.object({name: yup.string().required()}), []);
    const {register, handleSubmit, formState: { errors }} = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: ""
        }
    });
    const onSubmit = useCallback((data: any, event?: React.BaseSyntheticEvent) => {
        event?.preventDefault();
        addVariable(data.name);
    }, [id, addVariable]);

    const onBlur = useCallback(() => {
        formRef.current?.requestSubmit();
    }, []);

    useEffect(() => {
        if (!inputs) {
            addNodeInput(id, {
                id: id,
                name: "value",
                required: true,
                type: ParameterType.ANY
            });
        }
    }, [id, inputs, addNodeInput]);

    useEffect(() => {
        if (!outputs) {
            addNodeOutput(id, {
                id: "result",
                name: "result",
                type: ParameterType.ANY
            });
        }
    }, [id, outputs, addNodeOutput]);

    const inputClassName = errors["name"]
        ? "p-1 outline outline-red-500/50 focus:outline-red-500 max-h-[30px]"
        : "p-1 outline outline-blue-500/50 focus:outline-blue-500 max-h-[30px]";

    return (
        <Node
            id={id}
            name="set"
            hasExecute={true}
            hasContinue={true}
            position={position}
            executable={true}
            inputs={inputs}
            outputs={outputs}
            type={NodeType.SET}
            size={{width: 100, height: 100}}
        >
            <form ref={formRef} className="p-2" onSubmit={handleSubmit(onSubmit)}>
                <input {...register('name')} className={inputClassName} placeholder="Variable name" onBlur={onBlur}></input>
            </form>
        </Node>
    );
}