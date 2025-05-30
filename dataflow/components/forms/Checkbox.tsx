import { getValueByPath } from "@/dataflow/engine/utils";
import React, { DetailedHTMLProps, InputHTMLAttributes, useCallback } from "react";
import { useFormContext } from "react-hook-form";

type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    name: string;
    classNameOverride?: string;
    onBlur: () => void;
}

export default function Checkbox({id, name, className, classNameOverride, onBlur, ...props}: InputProps) {
    const {register, formState: {errors}} = useFormContext();
    const error = getValueByPath(errors, name);
    const colorClassName = error ? "border-red-500" : "border-blue-500";
    const registration = register(name);

    const handlePointerDownCapture = useCallback((e: React.PointerEvent<HTMLInputElement>) => {
        e.stopPropagation();
    }, []);

    const handleChange = useCallback((e: React.SyntheticEvent<HTMLInputElement>) => {
        registration.onChange(e);
        onBlur();
    }, [registration.onChange, onBlur]);

    return (
        <label>
            <input
                id={id}
                {...props}
                {...registration}
                onChange={handleChange}
                key={id}
                type="checkbox"
                onPointerDownCapture={handlePointerDownCapture}
                className="peer/checkbox hidden"
            ></input>
            <div className={`hidden peer-checked/checkbox:flex w-4 h-4 border border-dashed text-blue-500 ${colorClassName} items-center justify-center`}>
                ✓
            </div>
            <div className={`flex peer-checked/checkbox:hidden w-4 h-4 border border-dashed border-gray-300 items-center justify-center`}>
            </div>
        </label>
    );
}
