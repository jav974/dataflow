import { getValueByPath } from "@/dataflow/engine/utils";
import React, { DetailedHTMLProps, InputHTMLAttributes, useCallback, useMemo } from "react";
import { useFormContext } from "react-hook-form";

type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    name: string;
    classNameOverride?: string;
    styling?: "solid" | "dashed";
    onBlur: () => void;
}

export default function Checkbox({id, name, styling = "dashed", onBlur, ...props}: InputProps) {
    const {register, formState: {errors}} = useFormContext();
    const error = getValueByPath(errors, name);
    const colorClassName = error ? "border-red-500" : "border-blue-500/50";
    const registration = register(name);

    const handlePointerDownCapture = useCallback((e: React.PointerEvent<HTMLInputElement>) => {
        e.stopPropagation();
    }, []);

    const handleChange = useCallback((e: React.SyntheticEvent<HTMLInputElement>) => {
        registration.onChange(e);
        onBlur();
    }, [registration, onBlur]);

    const borderClass = useMemo(() => {
        switch (styling) {
            case 'dashed':
                return 'border-dashed';
            case 'solid':
            default:
                return 'border-solid';
        }
    }, [styling]);

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
            <div className={`hidden peer-checked/checkbox:flex w-4 h-4 border ${borderClass} text-blue-500 ${colorClassName} items-center justify-center`}>
                ✓
            </div>
            <div className={`flex peer-checked/checkbox:hidden w-4 h-4 border ${borderClass} ${colorClassName} items-center justify-center`}>
            </div>
        </label>
    );
}
