import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNodes } from "@/dataflow/contexts/NodeContext";

interface NodeWrapperProps {
    nodeId: string;
    children: React.ReactNode;
}

export default function NodeWrapper({ nodeId, children }: NodeWrapperProps) {
    const { renderTargets } = useNodes();
    const [layout, setLayout] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const el = renderTargets.ref.current.get(nodeId);

        if (el) {
            setLayout(el);
        }
    }, [renderTargets.lastUpdated]);

    if (!layout) {
        return null;
    }

    return createPortal(children, layout);
}
