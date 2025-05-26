import { useCallback, useState } from "react";
import PlayButton from "../buttons/PlayButton";
import { useUserGraph } from "@/contexts/UserGraphContext";
import NewGraphButton from "../buttons/NewGraphButton";
import NewGraphModal from "./NewGraphModal";
import SaveButton from "../buttons/SaveButton";
import DeleteGraphButton from "../buttons/DeleteGraphButton";
import DeleteGraphModal from "./DeleteGraphModal";
import { useGraphContext } from "@/contexts/GraphContext";
import { executeGraph } from "@/actions/graph";
import { runGraph } from "@/engine/graph";
import { useNodes } from "@/contexts/NodeContext";
import { getIOValues } from "@/engine/utils";

export default function Toolbar() {
    const { graphs, loadGraph, graph, saveGraph, deleteGraph } = useUserGraph();
    const { connections, nodes, zoom, variables, types, computedResult } = useGraphContext();
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const {setGraphResult} = useNodes();

    const onGraphChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        loadGraph(e.target.value);
    }, [loadGraph]);

    const onNewGraphClick = useCallback(() => {
        setIsNewModalOpen(true);
    }, []);

    const onSaveGraphClick = useCallback(() => {
        if (graph) {
            const newConfig = { ...graph };
            newConfig.connections = connections.ref.current;
            newConfig.nodes = nodes.ref.current;
            newConfig.zoom = zoom.ref.current;
            newConfig.types = types.ref.current;
            newConfig.variables = JSON.stringify(Object.fromEntries(variables.ref.current));
            saveGraph(graph.name, newConfig);
        }
    }, [graph, saveGraph]);

    const onDeleteGraphClick = useCallback(() => {
        setIsDeleteModalOpen(true);
    }, []);

    const onDeleteConfirm = useCallback(() => {
        if (graph) {
            deleteGraph(graph.name);
        }
    }, [graph, deleteGraph]);

    const onPlay = useCallback(() => {
        if (!isPlaying && graph) {
            setIsPlaying(true);
            // executeGraph(graph)
            //     .then((result) => console.log("Execution graph: ", result))
            //     .catch((reason: any) => console.log(reason));

            const result = runGraph(graph, {Ad: 36});
            setGraphResult(result);
            computedResult.update(result?.graph ? getIOValues(result.graph) : new Map());

            setTimeout(() => setIsPlaying(false), 0);
        }
    }, [graph, isPlaying]);

    return (
        <>
            <div className="grid grid-cols-3 absolute top-0 left-0 bg-black min-h-[50px] min-w-full z-10000">
                <div>
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
                </div>
                <div className="flex justify-center items-center">
                    {graph && <PlayButton isPlaying={isPlaying} onClick={onPlay}/>}
                </div>
                <div className="flex justify-end items-center pr-2 gap-4">
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
