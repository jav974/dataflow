import { InputConfig, jsonToMap, ParameterTypes, PrimitiveTypes } from "@dataflow-ide/dataflow-core";
import Node, { NodeProps } from "@dataflow-ui/components/core/Node";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useGraphContext } from "@dataflow-ui/contexts/GraphContext";
import Select from "@dataflow-ui/components/forms/Select";
import useKnownEvents from "@dataflow-ui/hooks/useKnownEvents";
import { useRefSignalEffect, useRefSignalRender } from "react-refsignal";
import useObservableNode from "@dataflow-ui/hooks/useObservableNode";

export default function CallEventNode({node}: NodeProps) {
    const {setNodeContext, setNodeInputs} = useGraphContext();
    const formRef = useRef<HTMLFormElement | null>(null);
    const schema = useMemo(() => yup.object({
        name: yup.string().required()
    }), []);
    const context = useMemo(() => jsonToMap<string>(node.context), [node.context]);
    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: context.get('name') ?? "",
        }
    });
    const eventId = useRef<string | undefined>(context.get('name'));

    const onBlur = useCallback(() => {
        formRef.current?.requestSubmit();
    }, []);

    const options = useKnownEvents();

    const updateNodeContext = useCallback((_eventId: string) => {
        const option = options.current.find(option => option.value === _eventId);

        if (option) {
            eventId.current = _eventId;
            setNodeContext(node.id, new Map().set('name', _eventId));
            const inputs: InputConfig[] = option.nodeSignal.current.outputs?.map(output => {
                return {
                    id: output.id,
                    name: output.name,
                    type: output.type,
                    isCollection: output.isCollection,
                    required: false,
                    typeEditable: false,
                    editable: PrimitiveTypes.includes(output.type as ParameterTypes),
                    collectionEditable: false,
                    defaultValue: node.inputs?.find(input => input.id === output.id)?.defaultValue
                }
            }) ?? [];
            setNodeInputs(node.id, inputs);
        }
    }, [node.id, node.inputs, setNodeContext, setNodeInputs, options]);

    const onSubmit = useCallback((data: any) => {
        if (data.name !== eventId.current) {
            updateNodeContext(data.name);
        }
    }, [updateNodeContext, node.id, options]);

    useEffect(() => {
        if (!eventId.current && options.current.length > 0) {
            updateNodeContext(options.current[0].value);
        }
    }, [options, updateNodeContext]);

    const eventNode = useObservableNode(eventId.current ?? "");

    useRefSignalEffect(() => {
        if (eventId.current) {
            updateNodeContext(eventId.current);
        }
    }, [eventNode, eventNode.current]);

    useRefSignalRender([options]);

    return (
        <Node
            node={node}
            size={{width: 200, height: 100}}
            hasExecute={true}
            hasContinue={true}
            headClassName="bg-slate-950/80"
        >
             <FormProvider {...methods}>
                <form ref={formRef} className="flex grow flex-nowrap items-end gap-1" onSubmit={methods.handleSubmit(onSubmit)}>
                    <Select className="grow" name="name" onBlur={onBlur} options={options.current}/>
                </form>
            </FormProvider>
        </Node>
    );
}
