import { useExtend } from '@pixi/react';
import { Container, FederatedPointerEvent, Graphics, Size } from 'pixi.js';
import React, { useCallback, useEffect, useMemo } from 'react';
import FastGraphics from './FastGraphics';
import useDraggable from '@/hooks/pixi/useDraggable';
import { PointerEventType, useNodes } from '@/contexts/NodeContext';
import { useGraphContext } from '@/contexts/GraphContext';
import usePointerPosition from '@/hooks/usePointerPosition';
import { BACKGROUND_LINE_STYLE, COLOR_BLUE } from '../config/Style';
import { useFetchPersistedState } from '@/hooks/usePersistedState';

export default function Background() {
    useExtend({Container});

    const { width, height } = useFetchPersistedState<Size>("dataflow-canvas-size", { width: 0, height: 0 });
    const { zoom, scale, canvasPosition } = useGraphContext();
    const { position, lastUpdated: positionLastUpdated, handlers } = useDraggable();
    const { position: pointerPosition, lastUpdated: pointerPositionLastUpdated } = usePointerPosition();
    const { onPointerUp, openContextMenu, selectionArea, selectionStart, startSelection, stopSelection } = useNodes();

    const backgroundSettings = useMemo(() => ({
        spacing: 40,
        lineSpacing: 10,
        dotRadius: 1,
    }), []);
    const backgroundFillSettings = useMemo(() => ({
        color: 0xFCEFEF,
        alpha: 1,
    }), []);
    const selectionFillSettings = useMemo(() => ({
        color: COLOR_BLUE,
        alpha: 0.5,
    }), []);

    // Update canvas position after background position or zoom changes
    useEffect(() => {
        canvasPosition.update({ x: position.x / scale.ref.current, y: position.y / scale.ref.current });
    }, [positionLastUpdated, zoom.lastUpdated]);

    // Update selection area when selection is started and pointer position changes
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

    // PIXI callback to draw the background grid
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
    }, [backgroundFillSettings, backgroundSettings, width, height]);

    // Open context menu on right click
    const handleRightClick = useCallback((e: FederatedPointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openContextMenu({ x: e.clientX, y: e.clientY });
    }, [openContextMenu]);

    // Stop selection or stop moving the canvas on pointer up
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

    // Either move the canvas or start selection rectangle on pointer down
    const handlePointerDown = useCallback((e: FederatedPointerEvent) => {
        if (e.ctrlKey) {    // Move canvas
            handlers.onPointerDown(e);
        } else {            // Create selection rectangle
            startSelection({x: e.clientX, y: e.clientY});
        }
    }, [handlers.onPointerDown]);

    // PIXI callback to draw selection rectangle
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
