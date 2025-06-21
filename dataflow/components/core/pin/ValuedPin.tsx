import { ParameterType, ParameterTypes } from "@/dataflow/config/schema";
import useHoverable from "@/dataflow/hooks/useHoverable";
import { useCallback, useMemo, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import Input from "@/dataflow/components/forms/Input";

interface ValuedPinProps {
    id: string;
    name: string;
    type: ParameterType;
    required: boolean;
    defaultValue: string;
    removable: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSubmit: (data: any, event?: React.BaseSyntheticEvent) => void;
    onRemove?: () => void;
}

export default function ValuedPin({id, name, type, required, defaultValue, removable, onSubmit, onRemove}: ValuedPinProps) {
    const {isHovered, handleMouseEnter, handleMouseLeave} = useHoverable();
    const formRef = useRef<HTMLFormElement | null>(null);
    const schema = useMemo((): yup.ObjectSchema<yup.AnyObject> => {
        let fieldSchema: yup.Schema;

        switch (type) {
            case ParameterTypes.NUMBER:
                fieldSchema = yup.number();
                break;
            case ParameterTypes.BOOLEAN:
                fieldSchema = yup.boolean();
                break;
            case ParameterTypes.STRING:
            default:
                fieldSchema = yup.string();
                break;
        }

        if (required) {
            fieldSchema = fieldSchema.required();
        }

        return yup.object({[id]: fieldSchema});
    }, [id, type, required]);

    const defaultPinValue = useMemo(() => {
        switch (type) {
            case ParameterTypes.NUMBER:
                return defaultValue ?? 0;
            case ParameterTypes.BOOLEAN:
                return defaultValue ?? "false";
            case ParameterTypes.ANY:
                return defaultValue;
            case ParameterTypes.STRING:
            default:
                return defaultValue ?? "";
        }
    }, [type, defaultValue]);

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            [id]: defaultPinValue
        }
    });

    const onBlur = useCallback(() => {
        formRef.current?.requestSubmit();
    }, []);

    return (
        <FormProvider {...methods}>
            <form ref={formRef} onSubmit={methods.handleSubmit(onSubmit)} onPointerEnter={handleMouseEnter} onPointerLeave={handleMouseLeave} className="flex grow">
                <div className="flex flex-col grow">
                    {name}
                    <Input className="grow" id={id} name={id} onBlur={onBlur} placeholder={name}/>
                </div>
                {removable && isHovered && <span className="text-red-500 ml-1 cursor-pointer" onClick={onRemove}>[x]</span>}
                <span className={`${required ? 'visible' : 'invisible'} text-red-500 ml-1`}>*</span>
            </form>
        </FormProvider>
    );
}
