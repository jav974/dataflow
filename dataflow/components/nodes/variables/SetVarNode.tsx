import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import Node, { NodeProps } from "../../core/Node";
import { useCallback, useMemo, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import Input from "@/dataflow/components/forms/Input";
import useKnownTypes from "@/dataflow/hooks/useKnownTypes";
import Select from "@/dataflow/components/forms/Select";
import Tooltip from "@/dataflow/components/ui/Tooltip";
import Checkbox from "@/dataflow/components/forms/Checkbox";
import { useComputed } from "@preact/signals-react";

interface SetVarNodeProps extends NodeProps {
}

export default function SetVarNode({node}: SetVarNodeProps) {
    const {setVariable, variables, setNodeInputs, setNodeOutputs} = useGraphContext();
    const {options} = useKnownTypes();
    const formRef = useRef<HTMLFormElement | null>(null);
    const schema = useMemo(() => yup.object({
        name: yup.string().required(),
        type: yup.string().required(),
        isCollection: yup.boolean().required()
    }), []);
    const variable = useComputed(() => variables.value.find(v => v.value.id === node.value.id));
    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: variable.value?.value.name ?? "",
            type: variable.value?.value.type ?? "boolean",
            isCollection: variable.value?.value.isCollection ?? false
        }
    });
    const onSubmit = useCallback((data: any) => {
        setVariable(node.value.id, data.name, data.type, data.isCollection);
        const input = node.value.inputs ? node.value.inputs[0] : undefined;
        const output = node.value.outputs ? node.value.outputs[0] : undefined;

        if (input) {
            setNodeInputs(node.value.id, [{...input, type: data.type, isCollection: data.isCollection}]);
        }

        if (output) {
            setNodeOutputs(node.value.id, [{...output, type: data.type, isCollection: data.isCollection}]);
        }
    }, [node.value.id, setVariable, setNodeInputs, setNodeOutputs]);

    const onBlur = useCallback(() => {
        formRef.current?.requestSubmit();
    }, []);

    const inputClassName = methods.formState.errors["name"]
        ? "p-1 outline outline-red-500/50 focus:outline-red-500 max-h-[30px] grow text-center"
        : "p-1 outline outline-blue-500/50 focus:outline-blue-500 max-h-[30px] grow text-center";

    return (
        <Node
            node={node}
            hasExecute={true}
            hasContinue={true}
            size={{width: 200, height: 100}}
        >
            <FormProvider {...methods}>
                <form ref={formRef} className="flex flex-nowrap items-end gap-1" onSubmit={methods.handleSubmit(onSubmit)}>
                    <Select name="type" onBlur={onBlur} options={options}/>
                    <Input className="grow text-center" name="name" placeholder="Variable name" onBlur={onBlur} />
                    <Tooltip tooltip="Collection?">
                        <Checkbox className="grow-0" name="isCollection" onBlur={onBlur}/>
                    </Tooltip>
                </form>
            </FormProvider>
        </Node>
    );
}
