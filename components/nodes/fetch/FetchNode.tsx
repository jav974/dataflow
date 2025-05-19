import { useCallback, useEffect, useState } from "react";
import Node, { type NodeProps } from "../../core/Node";
import { NodeType, ParameterType } from "../../config/Schema";
import { useGraphContext } from "@/contexts/GraphContext";
import FetchConfigModal from "./FetchConfigModal";

interface FetchNodeProps extends Omit<NodeProps, "type"> {
}

export default function FetchNode({ id, name, description, inputs, outputs, position }: FetchNodeProps) {
    const [url, setUrl] = useState<string>('');
    const [data, setData] = useState<any>(null);
    const {addNodeInput} = useGraphContext();
    const [configureModalOpen, setConfigureModalOpen] = useState(false);

    useEffect(() => {
        if (!inputs) {
            addNodeInput(id, {
                id: "url",
                name: "URL",
                type: ParameterType.STRING,
                required: false,
                editable: true
            });
        }
    }, [id, inputs, addNodeInput]);

    const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const urlValue = formData.get('url');

        fetch(urlValue as string)
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error('Error:', error));
    }, []);

    const toggleConfigureModal = useCallback(() => {
        setConfigureModalOpen(!configureModalOpen);
    }, [configureModalOpen]);

    return (
        <Node
            id={id}
            name={name}
            type={NodeType.FETCH}
            description={description}
            inputs={inputs}
            outputs={outputs}
            size={{ width: 300, height: 100 }}
            position={position}
            executable={true}
        >
            <div className="flex flex-col gap-2">
                {/* <form onSubmit={handleSubmit}>
                    <label htmlFor="url" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">URL</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                            </svg>
                        </div>
                        <input 
                            type="url" 
                            id="url" 
                            name="url"
                            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            placeholder="URL" 
                            required
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Fetch</button>
                    </div>
                </form> */}
                <div className="flex justify-center p-2">
                    <button className="text-blue-500 hover:underline cursor-pointer" onClick={toggleConfigureModal}>Configure</button>
                    
                    <FetchConfigModal isOpen={configureModalOpen} onClose={toggleConfigureModal}/>
                </div>
                {data && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                        <h2 className="text-lg font-bold">Data:</h2>
                        <pre className="mt-2 p-4 bg-white rounded-lg overflow-auto">{JSON.stringify(data, null, 2)}</pre>
                    </div>
                )}
            </div>
        </Node>
    );
}
