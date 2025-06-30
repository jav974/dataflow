import { useState } from "react";
import { createPortal } from "react-dom";
import { useNodeContext } from "@/dataflow/contexts/NodeContext";
import { useRefSignalEffect } from "react-refsignal";

interface NodeWrapperProps {
    nodeId: string;
    children: React.ReactNode;
}

export default function NodeWrapper({ nodeId, children }: NodeWrapperProps) {
    const { renderTargets } = useNodeContext();
    const [layout, setLayout] = useState<HTMLElement | null>(null);

    useRefSignalEffect(() => {
        const el = renderTargets.current.get(nodeId);

        if (el) {
            setLayout(el);
        }
    }, [renderTargets]);

    if (!layout) {
        return null;
    }

    return createPortal(children, layout);
}
