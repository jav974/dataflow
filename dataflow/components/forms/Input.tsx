import { getValueByPath } from "@/dataflow/engine/utils";
import React, { DetailedHTMLProps, InputHTMLAttributes, useCallback } from "react";
import { useFormContext } from "react-hook-form";

type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    name: string;
    orientation?: string;
    classNameOverride?: string;
    onBlur: () => void;
}

export default function Input({id, orientation, name, className, classNameOverride, onBlur, ...props }: InputProps) {
    const {register, formState: {errors}} = useFormContext();
    const error = getValueByPath(errors, name);
    const colorClassName = error ? "border-b-red-500/50 focus:border-b-red-500" : "border-b-blue-500/50 focus:border-b-blue-500";
    const baseClassName = "pl-1 pr-1 outline-none field-sizing-content min-w-[50px] max-h-[20px] border-b-1";
    const finalClassName = classNameOverride ?? `${className} ${baseClassName} ${orientation === "right" ? 'text-right' : ''} ${colorClassName}`;
    const registration = register(name);

    const handlePointerDownCapture = useCallback((e: React.PointerEvent<HTMLInputElement>) => {
        e.stopPropagation();
    }, []);

    const handleBlur = useCallback((e: React.SyntheticEvent<HTMLInputElement>) => {
        registration.onBlur(e);
        onBlur();
    }, [registration, onBlur]);

    return (
        <input
            {...props}
            {...registration}
            onBlur={handleBlur}
            key={id}
            className={finalClassName}
            onPointerDownCapture={handlePointerDownCapture}
        ></input>
    );
}
