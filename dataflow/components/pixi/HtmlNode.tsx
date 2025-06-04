import { PixiReactElementProps, useExtend } from '@pixi/react';
import { DOMContainer } from 'pixi.js';
import useDraggable from '@/dataflow/hooks/useDraggable';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNodes } from '@/dataflow/contexts/NodeContext';
import { Coordinates, NodeConfig } from '../../config/schema';
import { NodePositionUpdateEvent } from '@/dataflow/events/events';
import { useEvent } from '@/dataflow/hooks/useEvent';
import { useRefSignalEffect } from '@/dataflow/hooks/useRefSignal';

interface HtmlNodeProps extends PixiReactElementProps<typeof DOMContainer> {
    node: NodeConfig;
}

export default function HtmlNode({ node, ...props }: HtmlNodeProps) {
    useExtend({DOMContainer});

    const pixiRef = useRef<DOMContainer | null>(null);
    const { updateNodePosition, setRenderTarget } = useNodes();
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
    
    useRefSignalEffect(() => {
        updatePosition(position.ref.current);
    }, [position, updatePosition]);

    // Update the current position of useDraggable upon group selection drag
    // This is to ensure that next time we move a node that was part of a selection, we get it's current position
    // Otherwise the node would be briefly teleported to its former location (before selection move)
    useEvent<number>(NodePositionUpdateEvent(node.id), () => {
        position.ref.current.x = node.position.x;
        position.ref.current.y = node.position.y;
        updatePosition(node.position);
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

    // console.log("Rendering HtmlNode", node.id);

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
