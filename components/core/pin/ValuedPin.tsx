import { ParameterType } from "@/components/config/Schema";
import useHoverable from "@/hooks/useHoverable";
import { useCallback, useMemo, useRef } from "react";
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

interface ValuedPinProps {
    id: string;
    name: string;
    type: ParameterType;
    required: boolean;
    defaultValue: string;
    removable: boolean;
    onSubmit: (data: any, event?: React.BaseSyntheticEvent) => void;
    onRemove?: () => void;
}

export default function ValuedPin({id, name, type, required, defaultValue, removable, onSubmit, onRemove}: ValuedPinProps) {
    const {isHovered, handleMouseEnter, handleMouseLeave} = useHoverable();
    const formRef = useRef<HTMLFormElement | null>(null);
    const schema = useMemo((): yup.ObjectSchema<yup.AnyObject> => {
        let fieldSchema: yup.Schema;

        switch (type) {
            case ParameterType.NUMBER:
                fieldSchema = yup.number();
                break;
            case ParameterType.BOOLEAN:
                fieldSchema = yup.boolean();
                break;
            case ParameterType.STRING:
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
            case ParameterType.NUMBER:
                return defaultValue ?? 0;
            case ParameterType.BOOLEAN:
                return defaultValue ?? "false";
            case ParameterType.ANY:
                return undefined;
            case ParameterType.STRING:
            default:
                return defaultValue ?? "";
        }
    }, [type, defaultValue]);

    const {register, handleSubmit, formState: { errors }} = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            [id]: defaultPinValue
        }
    });

    const onBlur = useCallback(() => {
        formRef.current?.requestSubmit();
    }, []);

    const onPointerDownCapture = useCallback((e: React.PointerEvent<HTMLInputElement>) => {
        e.stopPropagation();
    }, []);

    const baseInputClassName = "p-1 outline field-sizing-fixed w-[65%] max-h-[20px]";
    // const baseInputClassName = "p-1 outline field-sizing-content max-h-[20px]";
    const inputClassName = `${baseInputClassName} ${errors[id]
        ? 'outline-red-500/50 focus:outline-red-500'
        : 'outline-blue-500/50 focus:outline-blue-500'
    }`;

    return (
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} onPointerEnter={handleMouseEnter} onPointerLeave={handleMouseLeave}>
            <input
                type="text"
                className={inputClassName}
                {...register(id)}
                onBlur={onBlur}
                onPointerDownCapture={onPointerDownCapture}
                placeholder={name}
            ></input>
            {removable && isHovered && <sup className="text-red-500 ml-1 cursor-pointer" onClick={onRemove}>[x]</sup>}
            {required && <span className="text-red-500 ml-1">*</span>}
        </form>
    );
}
