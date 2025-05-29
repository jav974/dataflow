import Connections from "../pixi/Connections";
import { Container } from "pixi.js";
import { useExtend } from "@pixi/react";
import HtmlNode from "../pixi/HtmlNode";
import ConnectionDrag from "../pixi/ConnectionDrag";
import { useGraphContext } from "@/contexts/GraphContext";

export default function ApplicationGraph() {
    useExtend({Container});

    const { name, nodes, zoom, canvasPosition } = useGraphContext();

    return (
        <pixiContainer
            position={canvasPosition.ref.current}
            scale={zoom.ref.current / 100}
            roundPixels={true}
        >
            {nodes.ref.current.map((node) => <HtmlNode key={`${name}_${node.id}`} node={node} />)}
            <Connections />
            <ConnectionDrag />
        </pixiContainer>
    );
}
