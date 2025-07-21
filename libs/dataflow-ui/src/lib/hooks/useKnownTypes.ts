import { GraphType } from "@dataflow-ide/dataflow-core";
import { OptionProps } from "@dataflow-ui/components/forms/Select";
import { useGraphContext } from "@dataflow-ui/contexts/GraphContext";
import { useMemo } from "react";

interface UseKnownTypesReturn {
    options: OptionProps[]
}

export default function useKnownTypes(): UseKnownTypesReturn {
    const {types} = useGraphContext();
    const lastUpdated = types.lastUpdated;

    const options: OptionProps[] = useMemo((): OptionProps[] => {
        // Reference lastUpdated to satisfy ESLint
        void lastUpdated;

        const options: OptionProps[] = [
            {name: "any", value: "any"},
            {name: "boolean", value: "boolean"},
            {name: "number", value: "number"},
            {name: "string", value: "string"},
            {name: "object", value: "object"},
        ];

        types.current.forEach((type: GraphType) => {
            options.push({name: type.name, value: type.id});
        });

        return options;
    }, [types, lastUpdated]);

    return {
        options
    };
}
