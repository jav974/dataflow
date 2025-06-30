import { GraphType, TypeDefinition } from "@/dataflow/config/schema";
import { COLOR_BLUE } from "@/dataflow/config/style";
import Node, { NodeProps } from "@/dataflow/components/core/Node";
import BaseIcon from "@/dataflow/components/icons/BaseIcon";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { AddCircleIcon } from "@hugeicons/core-free-icons";
import React, { useCallback, useMemo, useRef } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import Input from "@/dataflow/components/forms/Input";
import Select from "@/dataflow/components/forms/Select";
import Checkbox from "@/dataflow/components/forms/Checkbox";
import Tooltip from "@/dataflow/components/ui/Tooltip";
import { v4 as uuidv4 } from "uuid";
import useKnownTypes from "@/dataflow/hooks/useKnownTypes";
import { useRefSignalRender } from "react-refsignal";

export default function TypeDefNode({node}: NodeProps) {
    const {types} = useGraphContext();
    const {options: knownTypes} = useKnownTypes();
    const formRef = useRef<HTMLFormElement | null>(null);
    const schema = useMemo((): yup.ObjectSchema<TypeDefinition> => {
        return yup.object({
            id: yup.string().required(),
            name: yup.string().required(),
            properties: yup.array(yup.object({
                id: yup.string().required(),
                name: yup.string().required(),
                type: yup.string().required(),
                isCollection: yup.boolean().required()
            })).required()
        });
    }, []);
    const lastUpdated = types.lastUpdated;
    const type = useMemo((): GraphType | undefined => {
        void lastUpdated;
        return types.current.find((type: GraphType) => type.id === node.id);
    }, [node.id, types, lastUpdated]);

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            id: node.id,
            name: type?.name ?? '',
            properties: type?.properties ?? [
                {
                    id: uuidv4(),
                    name: "",
                    type: "boolean",
                    isCollection: false
                }
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "properties",
    });

    const onSubmit = useCallback((data: TypeDefinition) => {
        const type = types.current.find((type: GraphType) => type.id === data.id);

        if (!type) {
            types.current.push(data);
        } else {
            type.name = data.name;
            type.properties = data.properties;
        }

        types.notifyUpdate();
    }, [types]);

    const onBlur = useCallback(() => {
        formRef.current?.requestSubmit();
    }, [formRef]);

    const handleAddProperty = useCallback(() => {
        append({
            id: uuidv4(),
            name: "",
            type: "boolean",
            isCollection: false
        });
    }, [append]);

    const handleRemoveProperty = useCallback((e: React.PointerEvent<HTMLSpanElement>) => {
        const propertyIndex = Number((e.target as HTMLElement).dataset.index);
        remove(propertyIndex);
        onBlur();
    }, [remove, onBlur]);

    useRefSignalRender([types]);

    return (
        <Node
            node={node}
            size={{width: 250, height: 100}}
            hasContinue={false}
            hasExecute={false}
        >
            <FormProvider {...methods}>
                <form ref={formRef} onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col grow justify-center">
                    <Input className="text-center self-center" placeholder="Typename" name="name" onBlur={onBlur}/>

                    <div className="pt-4">
                        {fields.map((value, index: number) =>
                            <div className="flex flex-nowrap items-end gap-1 group" key={index}>
                                {fields.length > 1 &&
                                <span className="hidden self-center text-xs text-red-500 cursor-pointer group-hover:block" data-index={index} onClick={handleRemoveProperty}>
                                    [x]
                                </span>
                                }
                                <Select id={value.id} name={`properties.${index}.type`} options={knownTypes} onBlur={onBlur}/>
                                <Input className="grow" id={value.id} name={`properties.${index}.name`} placeholder="property name" onBlur={onBlur} />
                                <Tooltip tooltip="Collection?">
                                    <Checkbox className="grow-0" id={value.id} name={`properties.${index}.isCollection`} onBlur={onBlur}/>
                                </Tooltip>
                            </div>
                        )}

                        <div className="pt-4">
                            <div className="flex justify-center">
                                <BaseIcon
                                    icon={AddCircleIcon}
                                    size={16}
                                    color={COLOR_BLUE}
                                    strokeWidth={1.5}
                                    onClick={handleAddProperty}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </Node>
    );
}
