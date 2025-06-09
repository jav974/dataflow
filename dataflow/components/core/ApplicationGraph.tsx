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
            pixiRef.current.scale = zoom.ref.current / 100;
            pixiRef.current.position = {...canvasPosition.ref.current};
        }
    }, [zoom, canvasPosition]);

    useRefSignalRender([nodes]);

    return (
        <pixiContainer
            ref={pixiRef}
            position={{...canvasPosition.ref.current}}
            scale={zoom.ref.current / 100}
            roundPixels={true}
        >
            {nodes.ref.current.map((node) => <HtmlNode key={`${name}_${node.id}`} node={node} />)}
            <Connections />
            <ConnectionDrag />
        </pixiContainer>
    );
}
