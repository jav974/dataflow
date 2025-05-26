import { COLOR_BLUE } from "@/components/config/Style";
import BaseIcon from "@/components/icons/BaseIcon";
import { useGraphContext } from "@/contexts/GraphContext";
import useHoverable from "@/hooks/useHoverable";
import useLinkable from "@/hooks/useLinkable";
import { KeyframeLeftIcon } from "@hugeicons/core-free-icons";
import { useCallback } from "react";

interface PinBranchProps {
    nodeId: string;
    id: string;
    name: string;
    removable: boolean;
    onRef: (id: string, el: HTMLDivElement | null) => void;
}

export default function PinBranch({ nodeId, id, name, onRef, removable }: PinBranchProps) {
    const {isConnected, onClick, handlePointerDown, handlePointerUp} = useLinkable(nodeId, id, false, false, true);
    const {isHovered, handleMouseEnter, handleMouseLeave} = useHoverable();
    const {removeNodeBranch, removeConnections} = useGraphContext();

    const onPinRef = useCallback((el: HTMLDivElement | null) => {
        onRef(id, el);
    }, [nodeId, id, onRef]);

    const onRemove = useCallback(() => {
        removeNodeBranch(nodeId, id);
        removeConnections({id: nodeId, pin: id});
    }, [nodeId, id, removeNodeBranch, removeConnections]);

    return (
        <div className="text-sm text-gray-300 flex items-center gap-1 flex-row-reverse" onPointerEnter={handleMouseEnter} onPointerLeave={handleMouseLeave}>
            <div
                ref={onPinRef}
                onClick={onClick}
                onPointerDownCapture={handlePointerDown}
                onPointerUp={handlePointerUp}
            >
                <BaseIcon size={20} icon={KeyframeLeftIcon} color={COLOR_BLUE} fill={isConnected ? COLOR_BLUE : 'none'}/>
            </div>
            {name}
            {removable && <sup className={`${isHovered ? '' : 'invisible'} text-red-500 cursor-pointer`} onClick={onRemove}>[x]</sup>}
        </div>
    );
}
