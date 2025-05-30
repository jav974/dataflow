import { useCallback, useMemo, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import Select from "@/dataflow/components/forms/Select";
import Tooltip from "@/dataflow/components/ui/Tooltip";
import Checkbox from "@/dataflow/components/forms/Checkbox";
import useKnownTypes from "@/dataflow/hooks/useKnownTypes";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";

interface PinTypeFormProps {
    nodeId: string;
    pinId: string;
    isInput: boolean;
    type?: string;
    isCollection?: boolean;
}

export default function PinTypeForm({nodeId, pinId, isInput, type, isCollection}: PinTypeFormProps) {
    const {options} = useKnownTypes();
    const {updateNodeInput, updateNodeOutput} = useGraphContext();
    const formRef = useRef<HTMLFormElement | null>(null);
    const schema = useMemo(() => yup.object({
        type: yup.string().required(),
        isCollection: yup.boolean().required()
    }), []);
    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            type: type ?? "boolean",
            isCollection: isCollection ?? false
        }
    });
    const onSubmit = useCallback((data: any) => {
        if (isInput) {
            updateNodeInput(nodeId, {id: pinId, type: data.type, isCollection: data.isCollection});
        } else {
            updateNodeOutput(nodeId, {id: pinId, type: data.type, isCollection: data.isCollection});
        }
    }, [nodeId, pinId, isInput, updateNodeInput, updateNodeOutput]);

    const onBlur = useCallback(() => {
        formRef.current?.requestSubmit();
    }, []);

    return (
        <FormProvider {...methods}>
            <form ref={formRef} className="flex flex-nowrap items-end gap-1" onSubmit={methods.handleSubmit(onSubmit)}>
                <Select name="type" onBlur={onBlur} options={options}/>
                <Tooltip tooltip="Collection?">
                    <Checkbox className="grow-0" name="isCollection" onBlur={onBlur}/>
                </Tooltip>
            </form>
        </FormProvider>
    );
}
