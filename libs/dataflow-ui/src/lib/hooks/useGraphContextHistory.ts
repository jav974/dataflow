import { useMemo } from "react";
import { createProxyWithTarget } from "../utils/proxy";
import { GraphContextType } from "../contexts/types";
import { ConnectionConfig } from "@dataflow-ide/dataflow-core";
import { getRemoveConnectionsPredicate } from "../utils/utils";

export default function useGraphContextHistory(graphContext: GraphContextType) {
    const actionHistory = graphContext.actionHistory;

    return useMemo(() => createProxyWithTarget(graphContext, {
        addNode(target, node) {
            actionHistory.push({
                redo: () => target.addNode(node),
                undo: () => target.removeNode(node.id)
            });
        },

        removeNode(target, id: string) {
            const node = target.nodes.current.find(node => node.current.id === id);
            if (!node) return;

            actionHistory.push({
                redo: () => target.removeNode(id),
                undo: () => target.addNode(node.current)
            });
        },

        addConnection(target, connection: ConnectionConfig) {
            actionHistory.push({
                redo: () => target.addConnection(connection),
                undo: () => target.removeConnections(connection.from, connection.to)
            });
        },

        removeConnections(target, from, to) {
            const predicate = getRemoveConnectionsPredicate(from, to);
            if (!predicate) return;

            const connections = target.connections.current.filter(predicate);

            actionHistory.push({
                redo: () => target.removeConnections(from, to),
                undo: () => connections.map(conn => target.addConnection(conn))
            });
        },

        updateNode(target, node) {
            let previous = target.nodes.current.find(_node => _node.current.id === node.id)?.current;
            if (!previous) return ;
            previous = structuredClone(previous);

            actionHistory.push({
                redo: () => target.updateNode(node),
                undo: () => target.updateNode(previous)
            });
        },

        // setNodeInputs(target, id, inputs) {
        //     const previous = target.nodes.current.find(_node => _node.current.id === id)?.current;
        //     if (!previous) return ;
        //     const previousInputs = structuredClone(previous.inputs ?? []);

        //     actionHistory.push({
        //         redo: () => target.setNodeInputs(id, inputs),
        //         undo: () => target.setNodeInputs(id, previousInputs)
        //     });
        // },

        addNodeInput(target, id, input) {
            actionHistory.push({
                redo: () => target.addNodeInput(id, input),
                undo: () => target.removeNodeInput(id, input.id)
            });
        },

        removeNodeInput(target, nodeId, inputId) {
            const previous = target.nodes.current.find(_node => _node.current.id === nodeId)?.current;
            if (!previous) return ;
            const previousInput = structuredClone(previous.inputs?.find(i => i.id === inputId));
            if (!previousInput) return ;

            actionHistory.push({
                redo: () => target.removeNodeInput(nodeId, inputId),
                undo: () => target.addNodeInput(nodeId, previousInput)
            });
        },

        updateNodeInput(target, id, input) {
            const previous = target.nodes.current.find(_node => _node.current.id === id)?.current;
            if (!previous) return ;
            const previousInput = structuredClone(previous.inputs?.find(i => i.id === input.id));
            if (!previousInput) return ;

            actionHistory.push({
                redo: () => target.updateNodeInput(id, input),
                undo: () => target.updateNodeInput(id, previousInput)
            });
        },

        addNodeOutput(target, id, output) {
            actionHistory.push({
                redo: () => target.addNodeOutput(id, output),
                undo: () => target.removeNodeOutput(id, output.id)
            });
        },

        removeNodeOutput(target, nodeId, outputId) {
            const previous = target.nodes.current.find(_node => _node.current.id === nodeId)?.current;
            if (!previous) return ;
            const previousOutput = structuredClone(previous.outputs?.find(o => o.id === outputId));
            if (!previousOutput) return ;

            actionHistory.push({
                redo: () => target.removeNodeOutput(nodeId, outputId),
                undo: () => target.addNodeOutput(nodeId, previousOutput)
            });
        },

        // updateType(target, type) {
            
        // },

        // updateVariable(target, variable) {
            
        // },

        // addNodeBranch(target, id, branch) {
            
        // },

        // setNodeBranches(target, id, branches) {
            
        // },

        // setNodeContext(target, nodeId, context) {
            
        // },

        // removeNodeBranch(target, id, branchId) {
            
        // },

        splitInputParam(target, nodeId, inputId) {
            const previous = target.nodes.current.find(_node => _node.current.id === nodeId)?.current;
            if (!previous) return ;
            const previousInputs = previous.inputs ?? [];

            actionHistory.push({
                redo: () => target.splitInputParam(nodeId, inputId),
                undo: () => target.setNodeInputs(nodeId, previousInputs)
            });
        },

        splitOutputParam(target, nodeId, outputId) {
            const previous = target.nodes.current.find(_node => _node.current.id === nodeId)?.current;
            if (!previous) return ;
            const previousOutputs = previous.outputs ?? [];

            actionHistory.push({
                redo: () => target.splitOutputParam(nodeId, outputId),
                undo: () => target.setNodeOutputs(nodeId, previousOutputs)
            });
        },

        removeNodes(target, ids) {
            const nodes = structuredClone(target.nodes.current
                .filter(node => ids.includes(node.current.id))
                .map(node => node.current)
            );
            const connections = target.connections.current.filter(conn => ids.includes(conn.from.id) || ids.includes(conn.to.id));

            actionHistory.push({
                redo: () => target.removeNodes(ids),
                undo: () => {
                    nodes.forEach(node => target.addNode(node));
                    connections.forEach(conn => target.addConnection(conn));
                }
            });
        },
    }), [graphContext, actionHistory]);
}
