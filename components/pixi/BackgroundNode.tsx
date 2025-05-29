import { useExtend } from '@pixi/react';
import { Container, FederatedPointerEvent, Graphics } from 'pixi.js';
import React, { useCallback, useEffect, useMemo } from 'react';
import FastGraphics from './FastGraphics';
import useDraggable from '@/hooks/pixi/useDraggable';
import { PointerEventType, useNodes } from '@/contexts/NodeContext';
import { useGraphContext } from '@/contexts/GraphContext';
import usePointerPosition from '@/hooks/usePointerPosition';
import { BACKGROUND_LINE_STYLE, COLOR_BLUE } from '../config/Style';

interface BackgroundNodeProps {
    width: number;
    height: number;
}

export default function BackgroundNode({ width, height }: BackgroundNodeProps) {
    useExtend({Container});

    const { zoom, scale, canvasPosition } = useGraphContext();
    const { position, lastUpdated: positionLastUpdated, handlers } = useDraggable();
    const { position: pointerPosition, lastUpdated: pointerPositionLastUpdated } = usePointerPosition();
    const { onPointerUp, openContextMenu, selectionArea, selectionStart, startSelection, stopSelection } = useNodes();

    const backgroundSettings = useMemo(() => ({
        spacing: 40,
        lineSpacing: 10,
        dotRadius: 1,
    }), []);
    const dotFillSettings = useMemo(() => ({
        color: 0x2E4057,
        alpha: 1,
    }), []);
    const backgroundFillSettings = useMemo(() => ({
        color: 0xFCEFEF,
        alpha: 1,
    }), []);
    const selectionFillSettings = useMemo(() => ({
        color: COLOR_BLUE,
        alpha: 0.5,
    }), []);

    useEffect(() => {
        canvasPosition.update({ x: position.x / scale.ref.current, y: position.y / scale.ref.current });
    }, [positionLastUpdated, zoom.lastUpdated]);

    useEffect(() => {
        if (selectionStart) {
            selectionArea.update({
                x: Math.min(selectionStart.x, pointerPosition.x),
                y: Math.min(selectionStart.y, pointerPosition.y),
                width: Math.abs(pointerPosition.x - selectionStart.x),
                height: Math.abs(pointerPosition.y - selectionStart.y)
            });
        }
    }, [selectionStart, pointerPositionLastUpdated]);

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

        for (let x = startX; x < width; x += backgroundSettings.lineSpacing) {
            g.moveTo(x, 0);
            g.lineTo(x, height);
        }

        for (let y = startY; y < height; y += backgroundSettings.lineSpacing) {
            g.moveTo(0, y);
            g.lineTo(width, y);
        }

        g.stroke(BACKGROUND_LINE_STYLE);
    }, [backgroundFillSettings, backgroundSettings, drawDot, width, height]);

    const handleRightClick = useCallback((e: FederatedPointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openContextMenu({ x: e.clientX, y: e.clientY });
    }, [openContextMenu]);

    const handlePointerUp = useCallback((e: FederatedPointerEvent) => {
        onPointerUp({
            type: PointerEventType.POINTER_UP,
            x: e.clientX,
            y: e.clientY,
            element: "background"
        });

        if (selectionStart) {
            stopSelection();
        } else {
            handlers.onPointerUp();
        }
    }, [onPointerUp, selectionStart, handlers.onPointerUp]);

    const handlePointerDown = useCallback((e: FederatedPointerEvent) => {
        if (e.ctrlKey) {    // Move canvas
            handlers.onPointerDown(e);
        } else {            // Create selection rectangle
            startSelection({x: e.clientX, y: e.clientY});
        }
    }, [handlers.onPointerDown]);

    const drawSelection = useCallback((g: Graphics) => {
        g.clear();

        if (!selectionArea.ref.current) {
            return ;
        }

        g.rect(
            selectionArea.ref.current.x,
            selectionArea.ref.current.y,
            selectionArea.ref.current.width,
            selectionArea.ref.current.height,
        );
        g.fill(selectionFillSettings);
    }, [selectionStart, selectionFillSettings]);

    return <pixiContainer
        eventMode="static"
        {...handlers}
        onPointerDown={handlePointerDown}
        onRightClick={handleRightClick}
        onPointerUp={handlePointerUp}
    >
        <FastGraphics draw={draw} drawDependencies={[positionLastUpdated]} />
        <FastGraphics draw={drawSelection} drawDependencies={[selectionArea.lastUpdated]} />
    </pixiContainer>
}
