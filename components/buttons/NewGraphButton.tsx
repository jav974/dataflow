import { Add02Icon } from "@hugeicons/core-free-icons";
import BaseIcon from "../icons/BaseIcon";

interface NewGraphButtonProps {
    onClick: () => void;
}

export default function NewGraphButton({ onClick }: NewGraphButtonProps) {
    return <BaseIcon icon={Add02Icon} color="#4a90e2" onClick={onClick} />
}
