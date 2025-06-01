import { mock } from 'node:test';
import { AppConfig, NodeConfig, ConnectionConfig, VariableConfig, GraphType, NodeType, ParameterTypes } from '../config/schema';
import Graph from './Graph';

describe('Graph', () => {
  const mockConfig: AppConfig = {
    name: 'Test Graph',
    nodes: [
      { id: 'start', type: NodeType.START, executable: true } as NodeConfig,
      { id: 'return', type: NodeType.RETURN, executable: true } as NodeConfig,
    ],
    connections: [
      {
        id: 'start_continue:return_execute',
        from: { id: 'start', pin: 'continue' },
        to: { id: 'return', pin: 'execute' }
      } as ConnectionConfig
    ],
    variables: [
      { id: 'bool-single', name: 'bool single', type: ParameterTypes.BOOLEAN, isCollection: false } as VariableConfig,
      { id: 'bool-collection', name: 'bool collection', type: ParameterTypes.BOOLEAN, isCollection: true } as VariableConfig,
    ],
    types: [
    ],
    zoom: 75
  };

  it('loads from config and serializes to JSON', () => {
    const graph = Graph.load(mockConfig);
    expect(graph.toJSON()).toEqual(expect.objectContaining({
      name: mockConfig.name,
      nodes: mockConfig.nodes,
      connections: mockConfig.connections,
      variables: mockConfig.variables,
      types: mockConfig.types,
      zoom: mockConfig.zoom
    }));
  });

  it('loads from JSON string', () => {
    const json = JSON.stringify(mockConfig);
    const graph = Graph.loadFromJSON(json);
    expect(graph.toJSON().name).toBe('Test Graph');
  });

  it('throws on invalid JSON', () => {
    expect(() => Graph.loadFromJSON('not a json')).toThrow('Invalid JSON format');
  });

  it('can add node', () => {
    const graph = Graph.load(mockConfig);
    const newNode: NodeConfig = {
      id: 'new-node',
      name: 'New Node',
      type: NodeType.MATH_ADD,
      executable: false,
      position: { x: 100, y: 100 }
    };
    graph.addNode(newNode);
    expect(graph.getNode(newNode.id)).toEqual(expect.objectContaining(newNode));
  });

  
});
