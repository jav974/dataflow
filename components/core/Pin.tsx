import React, { useCallback, useMemo, useRef } from "react";
import useLinkable from "@/hooks/useLinkable";
import { useGraphContext } from "@/contexts/GraphContext";
import useHoverable from "@/hooks/useHoverable";
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { ParameterType } from "../config/Schema";

interface PinProps {
    nodeId: string;
    id: string;
    name: string;
    type: ParameterType;
    required?: boolean;
    isInput: boolean;
    removable?: boolean;
    defaultValue?: any;
    editable?: boolean;
    onRef: (id: string, el: HTMLDivElement | null) => void;
}

function Pin({ nodeId, id, name, type, required, isInput, onRef, removable = false, defaultValue, editable }: PinProps) {
    const {removeNodeInput, setInputDefaultValue} = useGraphContext();
    const {isConnected, onClick, handlePointerDown, handlePointerUp} = useLinkable(nodeId, id, isInput, !isInput);
    const {isHovered, handleMouseEnter, handleMouseLeave} = useHoverable();
    const formRef = useRef<HTMLFormElement | null>(null);
    const schema = useMemo((): yup.ObjectSchema<yup.AnyObject> => {
        let fieldSchema: yup.Schema;

        switch (type) {
            case ParameterType.NUMBER:
                fieldSchema = yup.number();
            case ParameterType.BOOLEAN:
                fieldSchema = yup.boolean();
            case ParameterType.STRING:
            default:
                fieldSchema = yup.string();
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
    
    const onPinRef = useCallback((el: HTMLDivElement | null) => {
        onRef(id, el);
    }, [nodeId, id, onRef]);
    
    const handleRemovePin = useCallback(() => {
        removeNodeInput(nodeId, id);
    }, [nodeId, id, removeNodeInput]);

    const pinContainerClass = "flex items-center gap-1" + (!isInput ? " flex-row-reverse" : "");
    const pinClass = isConnected
        ? "min-w-[12px] min-h-[12px] rounded-full bg-blue-500 cursor-pointer"
        : "min-w-[12px] min-h-[12px] rounded-full border-2 border-blue-500 bg-transparent cursor-pointer"
    ;

    const onSubmit = useCallback((data: any, event?: React.BaseSyntheticEvent) => {
        event?.preventDefault();
        setInputDefaultValue(nodeId, id, data[id]);
    }, [nodeId, id, setInputDefaultValue]);

    const onBlur = useCallback(() => {
        formRef.current?.requestSubmit();
    }, []);

    const onPointerDownCapture = useCallback((e: React.PointerEvent<HTMLInputElement>) => {
        e.stopPropagation();
    }, []);

    const inputClassName = errors[id]
        ? "p-1 outline field-sizing-fixed w-[65%] max-h-[20px] outline-red-500/50 focus:outline-red-500"
        : "p-1 outline field-sizing-fixed w-[65%] max-h-[20px] outline-blue-500/50 focus:outline-blue-500"
    ;

    return (
        <div className={pinContainerClass}>
            <div
                ref={onPinRef}
                className={pinClass}
                onClick={onClick}
                onPointerDownCapture={handlePointerDown}
                onPointerUp={handlePointerUp}
            >
            </div>
            <div className="text-gray-300 text-sm" onPointerEnter={handleMouseEnter} onPointerLeave={handleMouseLeave}>
                {!isInput && name}
                {isInput && !editable && name}
                {isInput && editable && !isConnected &&
                <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
                    <input
                        type="text"
                        className={inputClassName}
                        {...register(id)}
                        onBlur={onBlur}
                        onPointerDownCapture={onPointerDownCapture}
                        placeholder={name}
                    ></input>
                    {removable && isHovered && <sup className="text-red-500 ml-1 cursor-pointer" onClick={handleRemovePin}>[x]</sup>}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </form>
                }
                {required && !editable && <span className="text-red-500 ml-1">*</span>}
            </div>
        </div>
    );
}

export default Pin;
export type { PinProps };
