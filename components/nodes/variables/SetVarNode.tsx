import { useGraphContext } from "@/contexts/GraphContext";
import Node, { NodeProps } from "../../core/Node";
import { useCallback, useMemo, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import Input from "@/components/forms/Input";

interface SetVarNodeProps extends NodeProps {
}

export default function SetVarNode({node}: SetVarNodeProps) {
    const {setVariable, variables, setNodeContext} = useGraphContext();
    const formRef = useRef<HTMLFormElement | null>(null);
    const schema = useMemo(() => yup.object({name: yup.string().required()}), []);
    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: variables.ref.current.get(node.id) ?? ""
        }
    });
    const onSubmit = useCallback((data: any, event?: React.BaseSyntheticEvent) => {
        event?.preventDefault();
        setVariable(node.id, data.name);
        setNodeContext(node.id, (new Map()).set('var', data.name));
    }, [node.id, setVariable, setNodeContext]);

    const onBlur = useCallback(() => {
        formRef.current?.requestSubmit();
    }, []);

    const inputClassName = methods.formState.errors["name"]
        ? "p-1 outline outline-red-500/50 focus:outline-red-500 max-h-[30px] grow text-center"
        : "p-1 outline outline-blue-500/50 focus:outline-blue-500 max-h-[30px] grow text-center";

    return (
        <Node
            node={node}
            hasExecute={true}
            hasContinue={true}
            size={{width: 200, height: 100}}
        >
            <FormProvider {...methods}>
                <form ref={formRef} className="flex p-2" onSubmit={methods.handleSubmit(onSubmit)}>
                    <Input className="grow text-center" classNameOverride={inputClassName} name="name" placeholder="Variable name" onBlur={onBlur} />
                </form>
            </FormProvider>
        </Node>
    );
}
