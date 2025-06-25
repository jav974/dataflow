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
import { useRefSignalRender } from "react-refsignal";

interface VarType {
    name: string;
    type: string;
    isCollection: boolean;
}

export default function SetVarNode({node, ...props}: NodeProps) {
    const {setVariable, variables, types, setNodeInputs, setNodeOutputs} = useGraphContext();
    const {options} = useKnownTypes();
    const formRef = useRef<HTMLFormElement | null>(null);
    const schema = useMemo(() => yup.object({
        name: yup.string().required(),
        type: yup.string().required(),
        isCollection: yup.boolean().required()
    }), []);
    const lastUpdated = variables.lastUpdated;
    const variable = useMemo(() => {
        void lastUpdated;
        return variables.current.find(v => v.id === node.id)
    }, [node.id, variables, lastUpdated]);

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: variable?.name ?? "",
            type: variable?.type ?? "boolean",
            isCollection: variable?.isCollection ?? false
        }
    });
    const onSubmit = useCallback((data: VarType) => {
        setVariable(node.id, data.name, data.type, data.isCollection);
        
        setNodeInputs(node.id, [{
            id: 'default',
            name: 'default',
            required: false,
            type: data.type,
            isCollection: data.isCollection,
        }]);

        setNodeOutputs(node.id, [{id: 'result', name: 'var', type: data.type, isCollection: data.isCollection}]);
    }, [node.id, node.inputs, node.outputs, setVariable, setNodeInputs, setNodeOutputs]);

    const onBlur = useCallback(() => {
        formRef.current?.requestSubmit();
    }, []);

    useRefSignalRender([variables, types]);

    return (
        <Node
            node={node}
            hasExecute={true}
            hasContinue={true}
            size={{width: 200, height: 100}}
            {...props}
        >
            <FormProvider {...methods}>
                <form ref={formRef} className="flex grow flex-nowrap items-end gap-1" onSubmit={methods.handleSubmit(onSubmit)}>
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
