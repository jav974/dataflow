import { ParameterTypes } from "@dataflow-ide/dataflow-core";
import Node, { NodeProps } from "@dataflow-ui/components/core/Node";

export default function ReturnNode({node}: NodeProps) {
    return (
        <Node
            node={node}
            hasExecute={true}
            hasContinue={false}
            size={{width: 200, height: 100}}
            inputMultiple={true}
            inputMultipleType={ParameterTypes.ANY}
            minInputParams={0}
        />
    );
}
