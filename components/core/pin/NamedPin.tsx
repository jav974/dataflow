import { useCallback, useMemo, useRef } from "react";
import useHoverable from "@/hooks/useHoverable";
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

interface NamedPinProps {
    id: string;
    value: string;
    removable: boolean;
    orientation?: string;
    onSubmit: (data: any, event?: React.BaseSyntheticEvent) => void;
    onRemove?: () => void;
}

export default function NamedPin({id, value, removable, onSubmit, onRemove, orientation = "right"}: NamedPinProps) {
    const {isHovered, handleMouseEnter, handleMouseLeave} = useHoverable();
    const formRef = useRef<HTMLFormElement | null>(null);
    const schema = useMemo((): yup.ObjectSchema<yup.AnyObject> => {
        return yup.object({[id]: yup.string().required()});
    }, [id]);

    const {register, handleSubmit, formState: { errors }} = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            [id]: value
        }
    });

    const onBlur = useCallback(() => {
        formRef.current?.requestSubmit();
    }, []);

    const onPointerDownCapture = useCallback((e: React.PointerEvent<HTMLInputElement>) => {
        e.stopPropagation();
    }, []);

    const baseClassName = "ml-1 p-1 outline-none field-sizing-content min-w-[50px] max-h-[20px] border-b-1";
    const className = `${baseClassName} ${orientation === "right" ? 'text-right' : ''} ${errors[id]
        ? 'border-b-red-500/50 focus:border-b-red-500'
        : 'border-b-blue-500/50 focus:border-b-blue-500'
    }`;

    return (
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} onPointerEnter={handleMouseEnter} onPointerLeave={handleMouseLeave}>
            {removable && orientation === "right" && <sup className={`${isHovered ? '' : 'invisible'} text-red-500 cursor-pointer`} onClick={onRemove}>[x]</sup>}
            <input
                type="text"
                className={className}
                {...register(id)}
                onBlur={onBlur}
                onPointerDownCapture={onPointerDownCapture}
                placeholder={value}
            ></input>
            {removable && orientation === "left" && <sup className={`${isHovered ? '' : 'invisible'} text-red-500 cursor-pointer`} onClick={onRemove}>[x]</sup>}
        </form>
    );
}
