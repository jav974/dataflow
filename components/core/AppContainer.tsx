import { Application } from "@pixi/react";
import ApplicationTemplates from "./ApplicationTemplates";
import BackgroundNode from "../pixi/BackgroundNode";
import ApplicationGraph from "./ApplicationGraph";
import ContextMenu from "./ContextMenu";
import React, { useCallback, useEffect, useRef } from "react";
import { useNodes } from "@/contexts/NodeContext";
import Toolbar from "./Toolbar";
import { useUserGraph } from "@/contexts/UserGraphContext";
import { useGraphContext } from "@/contexts/GraphContext";
import { Size } from "pixi.js";
import { usePersistedState } from "@/hooks/usePersistedState";

export default function AppContainer() {
    const parentRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = usePersistedState<Size>("dataflow-canvas-size", {width: 0, height: 0});
    const { closeContextMenu } = useNodes();
    const { loadGraph, zoomIn, zoomOut, scale } = useGraphContext();
    const { graph } = useUserGraph();

    // Disable right click default context menu (will be replaced)
    const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
    }, []);

    // Close context menu on click anywhere
    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        closeContextMenu();
    }, [closeContextMenu]);

    const handleWheel = useCallback((e: WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();

            if (e.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        }
    }, []);

    useEffect(() => {
        if (!parentRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setSize({width: entry.contentRect.width, height: entry.contentRect.height});
            }
        });

        // Initial measurement
        const rect = parentRef.current.getBoundingClientRect();
        setSize({width: rect.width, height: rect.height});
        
        // Add resize observer
        resizeObserver.observe(parentRef.current);

        // Prevent zoom
        parentRef.current.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            resizeObserver.disconnect();
            parentRef.current?.removeEventListener("wheel", handleWheel);
        };
    }, []);

    useEffect(() => {
        if (graph) {
            loadGraph(graph);
        }
    }, [graph, loadGraph]);

    return (
        <div
            id="pixi-container"
            ref={parentRef}
            className="overflow-hidden select-none"
            style={{width: '100vw', height: '100vh', maxWidth: '100vw', maxHeight: '100vh'}}
            onContextMenu={handleContextMenu}
            onClick={handleClick}
        >
            <Toolbar />
            <Application
                bezierSmoothness={1}
                antialias={true}
                resizeTo={parentRef}
                clearBeforeRender={true}
                width={size.width}
                height={size.height}
                // preference="webgpu"
                preference="webgl"
                powerPreference="high-performance"
            >
                <BackgroundNode width={size.width} height={size.height} />
                <ApplicationGraph />
            </Application>
            <ApplicationTemplates />
            <ContextMenu />
        </div>
    );
}
