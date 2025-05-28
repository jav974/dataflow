import Connections from "../pixi/Connections";
import { Container } from "pixi.js";
import { extend } from "@pixi/react";
import HtmlNode from "../pixi/HtmlNode";
import ConnectionDrag from "../pixi/ConnectionDrag";
import { useGraphContext } from "@/contexts/GraphContext";

extend({ Container });

interface ApplicationGraphProps {
    width: number;
    height: number;
}

export default function ApplicationGraph({width, height}: ApplicationGraphProps) {
    const { nodes, zoom, canvasPosition } = useGraphContext();

    return (
        <pixiContainer
            position={canvasPosition.ref.current}
            scale={zoom.ref.current / 100}
            // pivot={{x: width / 2, y: height / 2}}
        >
            {nodes.ref.current.map((node) => <HtmlNode key={node.id} node={node} />)}
            <Connections />
            <ConnectionDrag />
        </pixiContainer>
    );
}
