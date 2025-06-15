import Connections from "../pixi/Connections";
import { Container } from "pixi.js";
import { useExtend } from "@pixi/react";
import HtmlNode from "../pixi/HtmlNode";
import ConnectionDrag from "../pixi/ConnectionDrag";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { useRef } from "react";
import { useRefSignalEffect, useRefSignalRender } from "react-refsignal";

export default function ApplicationGraph() {
    useExtend({Container});

    const pixiRef = useRef<Container | null>(null);
    const { name, nodes, zoom, canvasPosition } = useGraphContext();

    useRefSignalEffect(() => {
        if (pixiRef.current) {
            pixiRef.current.scale = zoom.current / 100;
            pixiRef.current.position = {...canvasPosition.current};
        }
    }, [zoom, canvasPosition]);

    useRefSignalRender([nodes]);

    return (
        <pixiContainer
            ref={pixiRef}
            position={{...canvasPosition.current}}
            scale={zoom.current / 100}
            roundPixels={true}
        >
            {nodes.current.map((nodeSignal) =>
                <HtmlNode key={`${name}_${nodeSignal.current.id}`} node={nodeSignal.current} />
            )}
            <Connections />
            <ConnectionDrag />
        </pixiContainer>
    );
}
