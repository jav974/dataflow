import { Application } from "@pixi/react";
import ApplicationTemplates from "./ApplicationTemplates";
import Background from "../pixi/Background";
import ApplicationGraph from "./ApplicationGraph";
import ContextMenu from "./ContextMenu";
import React, { useCallback, useEffect } from "react";
import { useNodeContext } from "@dataflow-ui/contexts/NodeContext";
import Toolbar from "./Toolbar";
import { useUserGraphContext } from "@dataflow-ui/contexts/UserGraphContext";
import { useGraphContext } from "@dataflow-ui/contexts/GraphContext";
import { useDashboardContext } from "@dataflow-ui/contexts/DashboardContext";
import { useRefSignalRender } from "react-refsignal";
import Console from "./Console";
import { Toaster } from 'react-hot-toast';
import Loader from "../ui/Loader/Loader";


export default function AppContainer() {
    const {canvasRef, canvasRect} = useDashboardContext();
    const { closeContextMenu } = useNodeContext();
    const { id, loadGraph, zoomIn, zoomOut } = useGraphContext();
    const { graph, isLoading } = useUserGraphContext();

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
        if (graph && graph.id !== id.current) {
            loadGraph(graph);
        }
    }, [graph, id, loadGraph]);

    // Force re-render when canvasRect changes
    useRefSignalRender([canvasRect], () => {
        return (
            canvasRect.current !== undefined &&
            canvasRef.current !== null &&
            (canvasRect.current.width !== canvasRef.current.getBoundingClientRect().width
            || canvasRect.current.height !== canvasRef.current.getBoundingClientRect().height)
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
            <div className="w-full h-full mt-[50px] relative">
                <div ref={canvasRef} className="w-full h-full">
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
                    <Toaster position="top-right" />
                    {isLoading && <Loader />}
                </div>
            </div>
            <ApplicationTemplates />
            <ContextMenu />
        </div>
    );
}
