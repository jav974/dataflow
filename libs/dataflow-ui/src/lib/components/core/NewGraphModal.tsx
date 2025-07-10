import { useCallback, useState } from "react";
import { useUserGraphContext } from "@dataflow-ui/contexts/UserGraphContext";
import { AppConfig, NodeConfig, NodeType } from "@dataflow-ide/dataflow-core";
import Modal from "./Modal";
import registry from "../nodes/registry";
import { v4 } from "uuid";
import { useDashboardContext } from "@dataflow-ui/contexts/DashboardContext";

interface NewGraphModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NewGraphModal({ isOpen, onClose }: NewGraphModalProps) {
    const [graphName, setGraphName] = useState("");
    const { saveGraph, loadGraph } = useUserGraphContext();
    const { canvasRect } = useDashboardContext();

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!graphName.trim()) return;

        const startNodeConfig = registry.get(NodeType.START)?.config;
        const returnNodeConfig = registry.get(NodeType.RETURN)?.config;
        let nodes: NodeConfig[] = [];

        if (startNodeConfig && returnNodeConfig) {
            const width = canvasRect.current?.width ?? 0;
            const height = canvasRect.current?.height ?? 0;
            const startNode = {id: 'start', ...startNodeConfig, position: {x: 100, y: height / 3 - 100}};
            const returnNode = {id: 'return', ...returnNodeConfig, position: {x: width - 300, y: height / 3 - 100}};
            nodes = [startNode, returnNode];
        }

        const newGraph: AppConfig = {
            id: v4(),
            name: graphName,
            nodes,
            connections: [],
            variables: [],
            types: [],
            zoom: 100
        };

        saveGraph(newGraph).then(() => {
            setGraphName("");
            loadGraph(newGraph.id);
            onClose();
        });
    }, [graphName, canvasRect, saveGraph, onClose, loadGraph]);

    return (
        <Modal title="Create New Graph" isOpen={isOpen}>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={graphName}
                    onChange={(e) => setGraphName(e.target.value)}
                    placeholder="Enter graph name"
                    className="w-full p-2 border border-gray-800 rounded mb-4 bg-gray-900 text-white placeholder-gray-500"
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Create
                    </button>
                </div>
            </form>
        </Modal>
    );
}
