import { jsonToMap, ParameterTypes } from "@dataflow-ide/dataflow-core";
import Node, { NodeProps } from "@dataflow-ui/components/core/Node";
import Input from "@dataflow-ui/components/forms/Input";
import { useCallback, useMemo, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useGraphContext } from "@dataflow-ui/contexts/GraphContext";

export default function NewEventNode({node}: NodeProps) {
    const {setNodeContext} = useGraphContext();
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

    const onBlur = useCallback(() => {
        formRef.current?.requestSubmit();
    }, []);

    const onSubmit = useCallback((data: any) => {
        setNodeContext(node.id, context.set('name', data.name));
    }, [setNodeContext, node.id, context]);

    return (
        <Node
            node={node}
            size={{width: 200, height: 100}}
            hasExecute={false}
            hasContinue={true}
            outputMultiple={true}
            headName={context.get('name') ? "Event: " + context.get('name') : node.name}
        >
             <FormProvider {...methods}>
                <form ref={formRef} className="flex grow flex-nowrap items-end gap-1" onSubmit={methods.handleSubmit(onSubmit)}>
                    <Input className="grow text-center" name="name" placeholder="Event name" onBlur={onBlur} />
                </form>
            </FormProvider>
        </Node>
    );
}
