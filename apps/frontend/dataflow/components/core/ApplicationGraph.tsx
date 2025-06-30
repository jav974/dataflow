import Connections from "../pixi/Connections";
import { Container } from "pixi.js";
import { useExtend } from "@pixi/react";
import ConnectionDrag from "../pixi/ConnectionDrag";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { useRef } from "react";
import { useRefSignalEffect } from "react-refsignal";
import Nodes from "../pixi/Nodes";

export default function ApplicationGraph() {
    useExtend({Container});

    const pixiRef = useRef<Container | null>(null);
    const { zoom, canvasPosition, isLoading } = useGraphContext();

    // Hide everything if graph is loading
    useRefSignalEffect(() => {
        if (pixiRef.current) {
            pixiRef.current.visible = !isLoading.current;
        }
    }, [isLoading]);

    // Update pixiRef to match zoom and canvasPosition
    useRefSignalEffect(() => {
        // Do not update anything as long as we are loading the graph to avoid visual glitch
        if (pixiRef.current && !isLoading.current) {
            pixiRef.current.scale = zoom.current / 100;
            pixiRef.current.position = {...canvasPosition.current};
        }
    }, [zoom, canvasPosition]);

    return (
        <pixiContainer
            ref={pixiRef}
            position={{...canvasPosition.current}}
            scale={zoom.current / 100}
            roundPixels={true}
            visible={!isLoading.current}
        >
            <Nodes />
            <Connections />
            <ConnectionDrag />
        </pixiContainer>
    );
}
