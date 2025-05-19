import Connections from "../pixi/Connections";
import { Container } from "pixi.js";
import { extend } from "@pixi/react";
import HtmlNode from "../pixi/HtmlNode";
import ConnectionDrag from "../pixi/ConnectionDrag";
import { useGraphContext } from "@/contexts/GraphContext";

extend({ Container });

export default function ApplicationGraph() {
    const { nodes, zoom, canvasPosition } = useGraphContext();

    return (
        <pixiContainer position={canvasPosition.ref.current} scale={zoom.ref.current / 100}>
            {nodes.ref.current.map((node) => <HtmlNode key={node.id} id={node.id} initialPosition={node.position} />)}
            <Connections />
            <ConnectionDrag />
        </pixiContainer>
    );
}
