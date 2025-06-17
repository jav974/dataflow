import { Application } from "@pixi/react";
import ApplicationTemplates from "./ApplicationTemplates";
import Background from "../pixi/Background";
import ApplicationGraph from "./ApplicationGraph";
import ContextMenu from "./ContextMenu";
import React, { useCallback, useEffect } from "react";
import { useNodeContext } from "@/dataflow/contexts/NodeContext";
import Toolbar from "./Toolbar";
import { useUserGraphContext } from "@/dataflow/contexts/UserGraphContext";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { useDashboardContext } from "@/dataflow/contexts/DashboardContext";
import { useRefSignalRender } from "react-refsignal";
import Console from "./Console";

export default function AppContainer() {
    const {canvasRef, canvasRect} = useDashboardContext();
    const { closeContextMenu } = useNodeContext();
    const { loadGraph, zoomIn, zoomOut } = useGraphContext();
    const { graph } = useUserGraphContext();

    // Disable right click default context menu (will be replaced)
    const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
    }, []);

    // Close context menu on click anywhere
    const handleClick = useCallback(() => {
        closeContextMenu();
    }, [closeContextMenu]);

    // Handle zoom with mouse wheel while holding ctrl key
    const handleWheel = useCallback((e: WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();

            if (e.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        }
    }, [zoomIn, zoomOut]);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Prevent zoom
        canvasRef.current.addEventListener("wheel", handleWheel, { passive: false });
        const currentCanvas = canvasRef.current;

        return () => {
            currentCanvas.removeEventListener("wheel", handleWheel);
        };
    }, [canvasRef, handleWheel]);

    // Load the graph when it changes (when user switches between graphs or at initial load)
    useEffect(() => {
        if (graph) {
            loadGraph(graph);
        }
    }, [graph, loadGraph]);

    // Force re-render when canvasRect changes
    useRefSignalRender([canvasRect], () => {
        return (
            canvasRect.current !== undefined &&
            canvasRef.current !== null &&
            canvasRect.current.width !== canvasRef.current.getBoundingClientRect().width
        );
    });

    return (
        <div
            id="pixi-container"
            className="overflow-hidden select-none"
            style={{width: '100vw', height: '100vh', maxWidth: '100vw', maxHeight: '100vh'}}
            onContextMenu={handleContextMenu}
            onClick={handleClick}
        >
            <div className="absolute min-w-full z-10000 max-h-[50px]">
                <Toolbar />
            </div>
            <div ref={canvasRef} className="w-full h-full mt-[50px]">
                <Application
                    bezierSmoothness={1}
                    antialias={true}
                    resizeTo={canvasRef}
                    clearBeforeRender={true}
                    width={canvasRect.current?.width ?? 0}
                    height={canvasRect.current?.height ?? 0}
                    // preference="webgpu"
                    preference="webgl"
                    powerPreference="high-performance"
                >
                    <Background />
                    <ApplicationGraph />
                </Application>
                <Console />
            </div>
            <ApplicationTemplates />
            <ContextMenu />
        </div>
    );
}
