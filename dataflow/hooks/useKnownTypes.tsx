import { GraphType } from "@/dataflow/config/schema";
import { OptionProps } from "@/dataflow/components/forms/Select";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { useMemo } from "react";

interface UseKnownTypesReturn {
    options: OptionProps[]
}

export default function useKnownTypes(): UseKnownTypesReturn {
    const {types} = useGraphContext();
    const options: OptionProps[] = useMemo((): OptionProps[] => {
        const options: OptionProps[] = [
            {name: "boolean", value: "boolean"},
            {name: "number", value: "number"},
            {name: "string", value: "string"},
        ];

        types.ref.current.forEach((type: GraphType) => {
            options.push({name: type.name, value: type.id});
        });

        return options;
    }, [types.lastUpdated.current]);

    return {
        options
    };
}
