import { Application } from "@pixi/react";
import ApplicationTemplates from "./ApplicationTemplates";
import Background from "../pixi/Background";
import ApplicationGraph from "./ApplicationGraph";
import ContextMenu from "./ContextMenu";
import React, { useCallback, useEffect } from "react";
import { useNodes } from "@/dataflow/contexts/NodeContext";
import Toolbar from "./Toolbar";
import { useUserGraph } from "@/dataflow/contexts/UserGraphContext";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { useDashboardContext } from "@/dataflow/contexts/DashboardContext";

export default function AppContainer() {
    const {viewPortRef: parentRef, viewPortSize} = useDashboardContext();
    const { closeContextMenu, setAllSelected, removeSelected } = useNodes();
    const { loadGraph, zoomIn, zoomOut } = useGraphContext();
    const { graph } = useUserGraph();

    // Disable right click default context menu (will be replaced)
    const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
    }, []);

    // Close context menu on click anywhere
    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
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
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        console.log("Key pressed:", e.key);

        if (e.key === 'Delete') {
            removeSelected();
        } else if (e.key === 'Escape') {
            setAllSelected(false);
        } else if ((e.ctrlKey || e.metaKey) && e.key === '+') {
            e.preventDefault();
            zoomIn();
        } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
            e.preventDefault();
            zoomOut();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            setAllSelected(true);
        }
    }, [setAllSelected, removeSelected, zoomIn, zoomOut]);

    useEffect(() => {
        if (!parentRef.current) return;

        // Prevent zoom
        parentRef.current.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            parentRef.current?.removeEventListener("wheel", handleWheel);
        };
    }, []);

    // Load the graph when it changes (when user switches between graphs or at initial load)
    useEffect(() => {
        if (graph) {
            loadGraph(graph);
        }
    }, [graph, loadGraph]);

    return (
        <div
            id="pixi-container"
            className="overflow-hidden select-none"
            style={{width: '100vw', height: '100vh', maxWidth: '100vw', maxHeight: '100vh'}}
            onContextMenu={handleContextMenu}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0} // Make the div focusable to capture key events
        >
            <Toolbar />
            <div ref={parentRef} className="w-full h-full">
                <Application
                    bezierSmoothness={1}
                    antialias={true}
                    resizeTo={parentRef}
                    clearBeforeRender={true}
                    width={viewPortSize.width}
                    height={viewPortSize.height}
                    // preference="webgpu"
                    preference="webgl"
                    powerPreference="high-performance"
                >
                    <Background />
                    <ApplicationGraph />
                </Application>
            </div>
            <ApplicationTemplates />
            <ContextMenu />
        </div>
    );
}
