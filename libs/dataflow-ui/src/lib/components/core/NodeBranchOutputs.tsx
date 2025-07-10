import { AddCircleIcon } from "@hugeicons/core-free-icons";
import { OutputBranchConfig } from "@dataflow-ide/dataflow-core";
import BaseIcon from "../icons/BaseIcon";
import { COLOR_BLUE } from "../../themes/style";
import useHoverable from "@dataflow-ui/hooks/useHoverable";
import { useGraphContext } from "@dataflow-ui/contexts/GraphContext";
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import PinBranch from "./pin/PinBranch";

interface NodeBranchOutputsProps {
    nodeId: string;
    multiple: boolean;
    branches?: OutputBranchConfig[];
    minBranches: number;
    onRef: (branchId: string, el: HTMLDivElement | null) => void;
}

export default function NodeBranchOutputs({nodeId, onRef, multiple, branches, minBranches}: NodeBranchOutputsProps) {
    const {isHovered, handleMouseEnter, handleMouseLeave} = useHoverable();
    const {addNodeBranch} = useGraphContext();

    const handleAddPin = useCallback(() => {
        addNodeBranch(nodeId, {
            id: uuidv4(),
            name: "Then"
        });
    }, [nodeId, addNodeBranch]);

    if (!branches?.length && !multiple) {
        return null;
    }

    return (
        <div
            className={`space-y-2 pb-2 pt-2 border-2 border-transparent ${multiple ? 'hover:border-gray-500 hover:border-dashed' : ''}`}
            onPointerEnter={handleMouseEnter}
            onPointerLeave={handleMouseLeave}
        >
            {branches?.map((branch) => (
                <PinBranch
                    key={branch.id}
                    nodeId={nodeId}
                    id={branch.id}
                    name={branch.name}
                    onRef={onRef}
                    removable={multiple && branches.length > minBranches}
                />
            ))}

            {multiple && isHovered &&
            <div className="flex justify-center">
                <BaseIcon
                    icon={AddCircleIcon}
                    size={16}
                    color={COLOR_BLUE}
                    strokeWidth={1.5}
                    onClick={handleAddPin}
                />
            </div>
            }
        </div>
    );
}
