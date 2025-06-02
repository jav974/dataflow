import { PixiReactElementProps, useExtend } from '@pixi/react';
import { DOMContainer } from 'pixi.js';
import useDraggable from '@/dataflow/hooks/useDraggable';
import { useEffect, useState } from 'react';
import { useNodes } from '@/dataflow/contexts/NodeContext';
import { NodeConfig } from '../../config/schema';
import { Signal, useSignalEffect } from "@preact/signals-react";

interface HtmlNodeProps extends PixiReactElementProps<typeof DOMContainer> {
    node: Signal<NodeConfig>;
}

export default function HtmlNode({ node: nodeSignal, ...props }: HtmlNodeProps) {
    useExtend({DOMContainer});

    const [node, setNode] = useState<NodeConfig>(nodeSignal.value);
    const [layout, setLayout] = useState<HTMLElement | undefined>(undefined);
    const { position, positionSignal, handlers } = useDraggable(node.position, false, false);
    const { updateNodePosition, setRenderTarget } = useNodes();
    
    // Update node when node signal changes
    useSignalEffect(() => {
        if (node !== nodeSignal.value) {
            position.x = nodeSignal.value.position.x;
            position.y = nodeSignal.value.position.y;
            
            // Update draggable position according to new node data
            if (
                positionSignal.value.x !== nodeSignal.value.position.x ||
                positionSignal.value.y !== nodeSignal.value.position.y
            ) {
                positionSignal.value = {...nodeSignal.value.position};
            }

            setNode(nodeSignal.value);
        }
    });

    // Update node position (as well as other selected nodes position)
    useSignalEffect(() => {
        if (
            positionSignal.value.x !== nodeSignal.value.position.x ||
            positionSignal.value.y !== nodeSignal.value.position.y
        ) {
            updateNodePosition(nodeSignal.value.id, positionSignal.value.x, positionSignal.value.y);
        }
    });

    useEffect(() => {
        const _layout = document.createElement('div');
        _layout.id = node.id;
        _layout.onpointerdown = handlers.onPointerDown;

        setLayout(_layout);
        setRenderTarget(node.id, _layout);

        return () => {
            _layout.onpointerdown = null;
            _layout.remove();
            setLayout(undefined);
        }
    }, [node.id, handlers.onPointerDown]);

    useEffect(() => {
        if (!layout) {
            return;
        }

        setRenderTarget(node.id, layout);
    }, [layout, node.id, setRenderTarget]);

    if (!layout) return null;

    return (
        <pixiDOMContainer
            element={layout}
            x={node.position.x}
            y={node.position.y}
            eventMode="none"
            {...props}
        />
    )
}
