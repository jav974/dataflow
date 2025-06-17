import { PixiReactElementProps, useExtend } from '@pixi/react';
import { DOMContainer } from 'pixi.js';
import useDraggable from '@/dataflow/hooks/useDraggable';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNodeContext } from '@/dataflow/contexts/NodeContext';
import { Coordinates, NodeConfig } from '../../config/schema';
import { NodePositionUpdateEvent } from '@/dataflow/events/events';
import { useEvent } from '@/dataflow/hooks/useEvent';
import { useRefSignalEffect } from 'react-refsignal';

interface HtmlNodeProps extends PixiReactElementProps<typeof DOMContainer> {
    node: NodeConfig;
}

export default function HtmlNode({ node, ...props }: HtmlNodeProps) {
    useExtend({DOMContainer});

    const pixiRef = useRef<DOMContainer | null>(null);
    const { updateNodePosition, setRenderTarget } = useNodeContext();
    // Updates position of pixi dom container, and the node's position in GraphContext
    const updatePosition = useCallback((position: Coordinates) => {
        if (pixiRef.current && (pixiRef.current.x !== position.x || pixiRef.current.y !== position.y)) {
            pixiRef.current.x = position.x;
            pixiRef.current.y = position.y;
        }

        if (node.position.x !== position.x || node.position.y !== position.y) {
            updateNodePosition(node.id, position.x, position.y);
        }
    }, [node, updateNodePosition]);
    const { position, handlers } = useDraggable(node.position);
    const [layout, setLayout] = useState<HTMLElement | undefined>(undefined);
    
    // Listen to position updates of useDraggable (ie: user is dragging the node) and call local updatePosition
    useRefSignalEffect(() => {
        updatePosition(position.current);
    }, [position, updatePosition]);

    // Update the current position of useDraggable upon group selection drag
    // This is to ensure that next time we move a node that was part of a selection, we get it's current position
    // Otherwise the node would be briefly teleported to its former location (before selection move)
    useEvent<number>(NodePositionUpdateEvent(node.id), () => {
        position.current.x = node.position.x;
        position.current.y = node.position.y;
        updatePosition(node.position);
    });

    // Effect on mount: Creates the layout (html div element) for the node
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
    }, [node.id, handlers.onPointerDown, setRenderTarget]);

    if (!layout) return null;

    return (
        <pixiDOMContainer
            ref={pixiRef}
            element={layout}
            x={node.position.x}
            y={node.position.y}
            eventMode="none"
            {...props}
        />
    )
}
