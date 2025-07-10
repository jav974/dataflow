import { useRefSignalMemo } from "react-refsignal";
import { useGraphContext } from "../contexts/GraphContext";

export default function useKnownVars() {
    const { variables } = useGraphContext();

    return useRefSignalMemo((): React.ReactElement[] => {
        const result: React.ReactElement[] = [];

        variables.current.forEach((variable) => {
            result.push(<option key={variable.id} value={variable.id}>{variable.name}</option>);
        });

        return result;
    }, [variables]);
}
