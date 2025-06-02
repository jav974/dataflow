import Connections from "../pixi/Connections";
import { Container } from "pixi.js";
import { useExtend } from "@pixi/react";
import HtmlNode from "../pixi/HtmlNode";
import ConnectionDrag from "../pixi/ConnectionDrag";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import React, { useState } from "react";
import { useComputed, useSignalEffect } from "@preact/signals-react";

export default function ApplicationGraph() {
    useExtend({Container});

    const { name, nodes, zoom, canvasPosition } = useGraphContext();
    const [scale, setScale] = useState<number>(1.0);
    const htmlNodes = useComputed(() => nodes.value.map((node) =>
        <HtmlNode key={`${name}_${node.value.id}`} node={node} />
    ));
    
    // Force re-render when zoom has changed
    useSignalEffect(() => {
        setScale(zoom.value / 100);
    });

    return (
        <pixiContainer
            position={canvasPosition.ref.current}
            scale={scale}
            roundPixels={true}
        >
            {htmlNodes.value}
            <Connections />
            <ConnectionDrag />
        </pixiContainer>
    );
}
