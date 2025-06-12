import { useCallback, useMemo, useState } from "react";
import { useUserGraph } from "@/dataflow/contexts/UserGraphContext";
import NewGraphButton from "../buttons/NewGraphButton";
import NewGraphModal from "./NewGraphModal";
import SaveButton from "../buttons/SaveButton";
import DeleteGraphButton from "../buttons/DeleteGraphButton";
import DeleteGraphModal from "./DeleteGraphModal";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { useDataflowContext } from "@/dataflow/contexts/DataflowContext";
import { OptionProps } from "../forms/Select";
import ResetViewButton from "../buttons/ResetViewButton";
import ZoomResetButton from "../buttons/ZoomResetButton";
import { useRefSignalRender } from "react-refsignal";
import ToolbarPlayer from "./ToolbarPlayer";

export default function Toolbar() {
    const { graphs, loadGraph, graph, saveGraph, deleteGraph } = useUserGraph();
    const { zoom, canvasPosition, toGraph } = useGraphContext();
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const {localExecutor, remoteExecutor, mode, setMode} = useDataflowContext();
    const availableModes = useMemo((): OptionProps[] => {
        const modes: OptionProps[] = [];
        if (localExecutor) {
            modes.push({name: "Local", value: "local"});
        }
        if (remoteExecutor) {
            modes.push({name: "Remote", value: "remote"});
        }
        return modes;
    }, [localExecutor, remoteExecutor]);

    const onGraphChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        loadGraph(e.target.value);
    }, [loadGraph]);

    const onNewGraphClick = useCallback(() => {
        setIsNewModalOpen(true);
    }, []);

    const onSaveGraphClick = useCallback(() => {
        if (graph) {
            const newConfig = { ...graph, ...toGraph() };
            saveGraph(graph.name, newConfig);
        }
    }, [graph, saveGraph, toGraph]);

    const onDeleteGraphClick = useCallback(() => {
        setIsDeleteModalOpen(true);
    }, []);

    const onDeleteConfirm = useCallback(() => {
        if (graph) {
            deleteGraph(graph.name);
        }
    }, [graph, deleteGraph]);

    const handleModeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMode = e.target.value as "local" | "remote";
        if (newMode !== mode) {
            setMode(newMode);
        }
    }, [mode, setMode]);

    const handleResetView = useCallback(() => {
        canvasPosition.update({ x: 0, y: 0 });
    }, []);

    const handleResetZoom = useCallback(() => {
        zoom.update(100);
    }, []);

    const handleChangeZoom = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newZoom = parseInt(e.target.value);
        if (!isNaN(newZoom) && newZoom >= 2 && newZoom <= 200) {
            zoom.update(newZoom);
        }
    }, []);

    // Force re-render when zoom changes
    useRefSignalRender([zoom]);

    return (
        <>
            <div className="grid grid-cols-3 bg-black min-h-[50px] min-w-full">
                <div className="flex justify-start items-center gap-4">
                    {graphs && graphs.length > 0 &&
                    <select 
                        className="select h-full bg-black text-white border border-transparent rounded px-4 py-2 focus:border-gray-800 hover:bg-gray-800 transition-colors duration-200" 
                        onChange={onGraphChange} 
                        value={graph?.name}
                    >
                        {graphs?.map((name, index) => (
                            <option key={index} value={name} className="bg-gray-900">{name}</option>
                        ))}
                    </select>
                    }
                    <ResetViewButton onClick={handleResetView}/>
                    <ZoomResetButton onClick={handleResetZoom}/>
                    <input
                        type="range"
                        id="zoom-range"
                        name="zoom"
                        min="2"
                        max="200"
                        value={zoom.ref.current}
                        onChange={handleChangeZoom}
                        className="w-40"
                        step="2" />
                </div>
                <div className="flex justify-center items-center">
                    <ToolbarPlayer />
                </div>
                <div className="flex justify-end items-center pr-2 gap-4">
                    {graph && availableModes.length > 0 && (
                        <select 
                            className="select h-full bg-black text-white border border-transparent rounded px-4 py-2 focus:border-gray-800 hover:bg-gray-800 transition-colors duration-200"
                            value={mode}
                            onChange={handleModeChange}
                        >
                            {availableModes.map((option, index) => (
                                <option key={index} value={option.value} className="bg-gray-900">
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {graph && <SaveButton onClick={onSaveGraphClick} />}
                    {graph && <DeleteGraphButton onClick={onDeleteGraphClick} />}
                    <NewGraphButton onClick={onNewGraphClick} />
                </div>
            </div>
            <NewGraphModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
            <DeleteGraphModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={onDeleteConfirm}
                graphName={graph?.name ?? ""}
            />
        </>
    );
}
