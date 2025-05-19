'use client';

import {extend} from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useEffect, useState } from 'react';
import FastGraphics from './FastGraphics';
import useDraggable from '@/hooks/pixi/useDraggable';
import { PointerEventType, useNodes } from '@/contexts/NodeContext';
import { useGraphContext } from '@/contexts/GraphContext';

extend({
    Container,
});

interface BackgroundNodeProps {
    width: number;
    height: number;
}

export default function BackgroundNode({ width, height }: BackgroundNodeProps) {
    const { zoom, scale, canvasPosition } = useGraphContext();
    const { position, lastUpdated: positionLastUpdated, handlers } = useDraggable();
    const { onPointerUp, openContextMenu } = useNodes();
    const [backgroundSettings, setBackgroundSettings] = useState({
        spacing: 40,
        dotRadius: 1,
    });
    const [dotFillSettings, setDotFillSettings] = useState({
        color: 0x2E4057,
        alpha: 1,
    });
    const [backgroundFillSettings, setBackgroundFillSettings] = useState({
        color: 0xFCEFEF,
        alpha: 1,
    });

    useEffect(() => {
        canvasPosition.update({ x: position.x / scale.ref.current, y: position.y / scale.ref.current });
    }, [positionLastUpdated, zoom.lastUpdated]);

    const drawDot = useCallback((g: Graphics, x: number, y: number, radius: number) => {
        g.circle(x, y, radius);
        g.fill(dotFillSettings);
    }, [dotFillSettings]);

    const draw = useCallback((g: Graphics) => {
        g.clear();
        g.rect(0, 0, width, height);
        g.fill(backgroundFillSettings);

        const startOffset = 0;
        const startX = startOffset + ((position.x / scale.ref.current) % backgroundSettings.spacing);
        const startY = startOffset + ((position.y / scale.ref.current) % backgroundSettings.spacing);

        for (let x = startX; x < width; x += backgroundSettings.spacing) {
            for (let y = startY; y < height; y += backgroundSettings.spacing) {
                drawDot(g, x, y, backgroundSettings.dotRadius);
            }
        }
    }, [backgroundFillSettings, backgroundSettings, drawDot]);

    const handleRightClick = useCallback((e: any) => {
        e.preventDefault();
        e.stopPropagation();
        openContextMenu({ x: e.clientX, y: e.clientY });
    }, [openContextMenu]);

    const handlePointerUp = useCallback((e: any) => {
        onPointerUp({
            type: PointerEventType.POINTER_UP,
            x: e.clientX * scale.ref.current,
            y: e.clientY * scale.ref.current,
            element: "background"
        });
    }, [onPointerUp]);

    return <pixiContainer
        eventMode="static"
        {...handlers}
        onRightClick={handleRightClick}
        onPointerUp={handlePointerUp}
    >
        <FastGraphics draw={draw} drawDependencies={[width, height, positionLastUpdated]} />
    </pixiContainer>
}
