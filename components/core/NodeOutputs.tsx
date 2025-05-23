import { NodeType, OutputBranchConfig, OutputConfig } from "../config/Schema";
import NodeBranchOutputs from "./NodeBranchOutputs";
import NodeValueOutputs from "./NodeValueOutputs";

interface NodeOutputsProps {
    nodeId: string;
    nodeType: NodeType;
    outputs?: OutputConfig[];
    multiple: boolean;
    branchMultiple: boolean;
    branches?: OutputBranchConfig[];
    minBranches: number;
    onOutputRef: (outputId: string, el: HTMLDivElement | null) => void;
    onBranchRef: (branchId: string, el: HTMLDivElement | null) => void;
}

export default function NodeOutputs({nodeId, nodeType, outputs, onOutputRef, onBranchRef, multiple, branches, branchMultiple, minBranches}: NodeOutputsProps) {
    if (!outputs?.length && !branches?.length && !multiple && !branchMultiple) {
        return null;
    }

    return (
        <div>
            <NodeBranchOutputs nodeId={nodeId} multiple={branchMultiple} onRef={onBranchRef} branches={branches} minBranches={minBranches}/>
            <NodeValueOutputs nodeId={nodeId} multiple={multiple} nodeType={nodeType} onRef={onOutputRef} outputs={outputs} />
        </div>
    );
}
