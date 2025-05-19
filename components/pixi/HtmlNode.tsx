'use client';

import { extend, PixiReactElementProps } from '@pixi/react';
import { DOMContainer } from 'pixi.js';
import useDraggable from '@/hooks/pixi/useDraggable';
import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNodes } from '@/contexts/NodeContext';

extend({
    DOMContainer
});

interface HtmlNodeProps extends PixiReactElementProps<typeof DOMContainer> {
    initialPosition: { x: number, y: number };
    id?: string;
}

export default function HtmlNode({ initialPosition, id: providedId, ...props }: HtmlNodeProps) {
    const id = useMemo(() => providedId || uuidv4(), [providedId]);
    const { position, handlers, lastUpdated: positionLastUpdated } = useDraggable(initialPosition);
    const [layout, setLayout] = useState<HTMLElement | undefined>(undefined);
    const { updateNodePosition, setRenderTarget } = useNodes();

    useEffect(() => {
        const _layout = document.createElement('div');
        _layout.id = id;
        _layout.onpointerdown = (e) => handlers.onPointerDown(e);

        setLayout(_layout);
        setRenderTarget(id, _layout);

        return () => {
            _layout.onpointerdown = null;
            _layout.remove();
            setLayout(undefined);
        }
    }, [id, handlers]);

    useEffect(() => {
        if (!layout) {
            return;
        }

        setRenderTarget(id, layout);
    }, [layout, id, setRenderTarget]);

    useEffect(() => {
        updateNodePosition(id, position.x, position.y);
    }, [updateNodePosition, id, positionLastUpdated]);

    if (!layout) return null;

    return (
        <pixiDOMContainer
            element={layout}
            x={position.x}
            y={position.y}
            eventMode="static"
            {...handlers}
            {...props}
        />
    )
}
