import { KeyframeRightIcon } from "@hugeicons/core-free-icons";
import { COLOR_BLUE } from "../../../config/style";
import BaseIcon from "../../icons/BaseIcon";
import useLinkable from "@/dataflow/hooks/useLinkable";

interface PinExecuteProps {
    id: string;
    onRef: (el: HTMLDivElement | null) => void;
}

export default function PinExecute({ id, onRef }: PinExecuteProps) {
    const {isConnected, onClick, handlePointerDown, handlePointerUp} = useLinkable(id, "execute");

    return (
        <div
            ref={onRef}
            className="justify-self-start"
            onPointerUp={handlePointerUp}
            onPointerDownCapture={handlePointerDown}
            onClick={onClick}
        >
            <BaseIcon icon={KeyframeRightIcon} color={COLOR_BLUE} fill={isConnected ? COLOR_BLUE : 'none'} />
        </div>
    );
}
