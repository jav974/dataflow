import { COLOR_BLUE } from "../../../themes/style";
import BaseIcon from "../../icons/BaseIcon";
import { KeyframeLeftIcon } from "@hugeicons/core-free-icons";
import useLinkable from "@dataflow-ui/hooks/useLinkable";

interface PinContinueProps {
    id: string;
    onRef: (el: HTMLDivElement | null) => void;
}

export default function PinContinue({ id, onRef }: PinContinueProps) {
    const {isConnected, onClick, handlePointerDown, handlePointerUp} = useLinkable(id, "continue");

    return (
        <div
            ref={onRef}
            className="justify-self-end cursor-pointer"
            onPointerUp={handlePointerUp}
            onPointerDownCapture={handlePointerDown}
            onClick={onClick}
        >
            <BaseIcon icon={KeyframeLeftIcon} color={COLOR_BLUE} fill={isConnected ? COLOR_BLUE : 'none'}/>
        </div>
    );
}
