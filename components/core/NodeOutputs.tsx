import { OutputConfig } from "../config/Schema";
import Pin from "./Pin";

interface NodeOutputsProps {
    nodeId: string;
    outputs?: OutputConfig[];
    onRef: (outputId: string, el: HTMLDivElement | null) => void;
}

export default function NodeOutputs({nodeId, outputs, onRef}: NodeOutputsProps) {
    return (
        <div className="space-y-2 pt-2">
            {outputs?.map((output) => (
                <Pin
                    key={output.id}
                    id={output.id}
                    nodeId={nodeId}
                    name={output.name}
                    type={output.type}
                    isInput={false}
                    onRef={onRef}
                />
            ))}
        </div>
    );
}
