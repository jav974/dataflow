import { getValueByPath } from "@/dataflow/engine/utils";
import React, { DetailedHTMLProps, InputHTMLAttributes, useCallback } from "react";
import { useFormContext } from "react-hook-form";

export interface OptionProps {
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
}

export type SelectProps = DetailedHTMLProps<InputHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & {
    name: string;
    classNameOverride?: string;
    onBlur: () => void;
    options: OptionProps[]
}

export default function Select({id, name, className, classNameOverride, options, onBlur, ...props}: SelectProps) {
    const {register, formState: {errors}} = useFormContext();
    const error = getValueByPath(errors, name);
    const colorClassName = error
        ? "outline-red-500/50 focus:outline-red-500"
        : "outline-blue-500/50 focus:outline-blue-500"
    ;
    const finalClassName = classNameOverride ?? `${className} mb-0.25 bg-gray-700 outline ${colorClassName}`;
    const registration = register(name);

    const handlePointerDownCapture = useCallback((e: React.PointerEvent<HTMLSelectElement>) => {
        e.stopPropagation();
    }, []);

    const handleChange = useCallback((e: React.SyntheticEvent<HTMLSelectElement>) => {
        registration.onChange(e);
        onBlur();
    }, [registration, onBlur]);

    return (
        <select
            key={id}
            onPointerDownCapture={handlePointerDownCapture}
            className={finalClassName}
            {...registration}
            {...props}
            onChange={handleChange}
        >
            {options.map((option: OptionProps, index: number) =>
                <option key={index} value={option.value}>{option.name}</option>
            )}
        </select>
    );
}
