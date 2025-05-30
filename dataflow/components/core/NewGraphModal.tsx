import { useCallback, useState } from "react";
import { useUserGraph } from "@/dataflow/contexts/UserGraphContext";
import { AppConfig, NodeConfig, NodeType } from "@/dataflow/config/schema";
import Modal from "./Modal";
import registry from "../nodes/registry";

interface NewGraphModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NewGraphModal({ isOpen, onClose }: NewGraphModalProps) {
    const [graphName, setGraphName] = useState("");
    const { saveGraph, loadGraph } = useUserGraph();

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!graphName.trim()) return;

        const startNodeConfig = registry.get(NodeType.START)?.config;
        const returnNodeConfig = registry.get(NodeType.RETURN)?.config;
        let nodes: NodeConfig[] = [];

        if (startNodeConfig && returnNodeConfig) {
            const startNode = {id: 'start', ...startNodeConfig, position: startNodeConfig.position ?? {x: 500, y: 500}};
            const returnNode = {id: 'return', ...returnNodeConfig, position: returnNodeConfig.position ?? {x: 500, y: 500}};
            nodes = [startNode, returnNode];
        }

        const newGraph: AppConfig = {
            name: graphName,
            nodes,
            connections: [],
            variables: [],
        };

        saveGraph(graphName, newGraph);
        setGraphName("");
        loadGraph(graphName);
        onClose();
    }, [graphName, saveGraph, onClose]);

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
