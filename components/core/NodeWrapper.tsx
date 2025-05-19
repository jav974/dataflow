import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNodes } from "@/contexts/NodeContext";

export default function NodeWrapper({ nodeId, children }: { nodeId: string, children?: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const { renderTargets } = useNodes();
    const [layout, setLayout] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const el = renderTargets.ref.current.get(nodeId);

        if (!el) {
            return;
        }

        setLayout(el);
    }, [renderTargets.lastUpdated]);

    if (!layout) {
        return null;
    }

    return createPortal(<div ref={ref}>{children}</div>, layout);
}
