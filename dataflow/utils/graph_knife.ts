import { AppConfig, ConnectionConfig, Coordinates, NodeConfig, NodeType } from "../config/schema";
import { v4 as uuidv4 } from "uuid";

interface NodeConnections {
    node: NodeConfig;
    connections: ConnectionConfig[];
}

export function remapGraphIds(graph: AppConfig): AppConfig {
    const newGraph = structuredClone(graph);
    const nodeConnectionsMap = getNodeConnectionsMap(newGraph);

    // Update the node ids (each node must have a unique id, except for START, RETURN and TRIGGER node types)
    newGraph.nodes.forEach(node => {
        // Do not update ids of special nodes
        if (node.type === NodeType.START || node.type === NodeType.RETURN || node.type === NodeType.TRIGGER) {
            return ;
        }

        const newId = uuidv4();

        // Update node connections from old id to new id
        nodeConnectionsMap.get(node.id)?.connections.forEach(conn => {
            if (conn.from.id === node.id) {
                conn.from.id = newId;
            } else if (conn.to.id === node.id) {
                conn.to.id = newId;
            }
        });

        // Update nodeConnectionsMap key to match new node id
        nodeConnectionsMap.set(newId, nodeConnectionsMap.get(node.id) as NodeConnections);
        nodeConnectionsMap.delete(node.id);

        // New Variable node needs to reflect their new id to graph.variables
        if (node.type === NodeType.NEW) {
            const variable = newGraph.variables.find(variable => variable.id === node.id);
            
            if (variable) {
                variable.id = newId;
            }
        }

        // Update node id
        node.id = newId;
    });

    return newGraph;
}

export function getNodeConnectionsMap(graph: AppConfig): Map<string, NodeConnections> {
    const nodeConnectionsMap = new Map<string, NodeConnections>();

    // Map selected nodes and their connections
    graph.nodes.forEach((node) => {
        // Fetch node connections
        const connections = graph.connections?.filter(conn =>
            conn.from.id === node.id || conn.to.id === node.id
        ) ?? [];
        nodeConnectionsMap.set(node.id, { node, connections });
    });

    return nodeConnectionsMap;
}

export function getPartialGraph(graph: AppConfig, selectedNodes: string[]): AppConfig | undefined {
    if (selectedNodes.length === 0) return undefined;

    const newGraph = structuredClone(graph);

    // Keep only selected nodes
    newGraph.nodes = newGraph.nodes.filter(node => selectedNodes.includes(node.id));
    const nodeConnectionsMap = getNodeConnectionsMap(newGraph);

    // Keep only variables tied to selected nodes (usually just new_variable node)
    newGraph.variables = newGraph.variables.filter(variable => nodeConnectionsMap.has(variable.id));
    // Keep only types tied to selected nodes (usually just typedef_node)
    newGraph.types = newGraph.types?.filter(type => nodeConnectionsMap.has(type.id));

    // Filter connections again, to only retain inner new node ids connection (remove outer scoped connections)
    newGraph.connections = newGraph.connections?.filter(conn =>
        nodeConnectionsMap.has(conn.from.id) && nodeConnectionsMap.has(conn.to.id)
    );

    return newGraph;
}

export function pastePartialGraph(partial: AppConfig, cursorPosition: Coordinates, kind: 'copy' | 'cut'): AppConfig {
    // Update the node ids (each node must have a unique id)
    const graph = kind === 'copy' ? remapGraphIds(partial) : structuredClone(partial);
    // Compute center of selected nodes
    const center = getBoundingBoxCenter(partial.nodes.map(node => node.position));
    // Compute offset based on cursor position
    const offset: Coordinates = {
        x: cursorPosition.x - center.x,
        y: cursorPosition.y - center.y
    }

    // Mutates node positions
    graph.nodes.forEach(node => {
        node.position.x += offset.x;
        node.position.y += offset.y;
    });

    return graph;
}

export function getBoundingBoxCenter(coords: Coordinates[]) {
    const xs = coords.map(n => n.x);
    const ys = coords.map(n => n.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
    };
}
