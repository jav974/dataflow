'use client'

import { executeGraph } from '@/actions/graph';
import { DataflowProvider } from '@dataflow-ui/contexts/DataflowContext';
import { GraphResult } from '@dataflow-core/engine/types';
import { useDataflowGraph } from '@dataflow-ui/hooks/useDataflowGraph';
import { useEffect } from 'react';

function Child() {
    const {result, loading, error} = useDataflowGraph("test", {Ad: 42});

    useEffect(() => {
        if (loading) {
            console.log("Graph is loading...");
        } else {
            console.log("Graph has finished loading.");
        }
        if (error) {
            console.error("Error executing graph:", error);
        } else if (result) {
            console.log("Graph execution result:", result);
        }
    }, [loading, result, error]);

    return (
        <div>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {result && (
                <div>
                    <h2>Graph Result</h2>
                    <pre>{JSON.stringify((result as GraphResult).result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default function Page() {
  return (
    <DataflowProvider remoteExecutor={executeGraph}>
        <Child />
    </DataflowProvider>
  );
}
