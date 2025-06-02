import { OptionProps } from "@/dataflow/components/forms/Select";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { useComputed } from "@preact/signals-react";

interface UseKnownTypesReturn {
    options: OptionProps[]
}

export default function useKnownTypes(): UseKnownTypesReturn {
    const {types} = useGraphContext();
    const options = useComputed((): OptionProps[] => {
        const options: OptionProps[] = [
            {name: "boolean", value: "boolean"},
            {name: "number", value: "number"},
            {name: "string", value: "string"},
        ];

        types.value.forEach((type) => {
            options.push({name: type.value.name, value: type.value.id});
        });

        return options;
    });

    return {
        options: options.value
    };
}
