import { useExtend } from '@pixi/react';
import { Container, FederatedPointerEvent, Graphics } from 'pixi.js';
import React, { useCallback, useMemo } from 'react';
import FastGraphics from './FastGraphics';
import useDraggable from '@/dataflow/hooks/useDraggable';
import { PointerEventType, useNodes } from '@/dataflow/contexts/NodeContext';
import { useGraphContext } from '@/dataflow/contexts/GraphContext';
import { BACKGROUND_LINE_STYLE, COLOR_BLUE } from '../../config/style';
import { useRefSignalEffect } from '@/dataflow/hooks/useRefSignal';
import { useDashboardContext } from '@/dataflow/contexts/DashboardContext';

export default function Background() {
    useExtend({Container});

    const { canvasRect, pointerPosition } = useDashboardContext();
    const { scale, canvasPosition } = useGraphContext();
    const { position, handlers } = useDraggable(canvasPosition.ref.current);
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

    // Update position after scale changes
    // This is to avoid a brief teleport to former location before scale apply
    useRefSignalEffect(() => {
        if (scale.lastUpdated.current > position.lastUpdated.current) {
            position.update({
                x: position.ref.current.x * scale.ref.current,
                y: position.ref.current.y * scale.ref.current,
            })
        }
    }, [scale]);

    // Update canvas position after background position changes
    useRefSignalEffect(() => {
        if (canvasPosition.lastUpdated.current !== position.lastUpdated.current) {
            canvasPosition.ref.current = {
                x: position.ref.current.x / scale.ref.current,
                y: position.ref.current.y / scale.ref.current
            };
            canvasPosition.lastUpdated.current = position.lastUpdated.current;
            canvasPosition.notify();
        }
    }, [position]);

    // Reset background position according to canvas position external change
    useRefSignalEffect(() => {
        if (canvasPosition.lastUpdated.current !== position.lastUpdated.current) {
            position.ref.current.x = canvasPosition.ref.current.x;
            position.ref.current.y = canvasPosition.ref.current.y;
            position.lastUpdated.current = canvasPosition.lastUpdated.current;
        }
    }, [canvasPosition]);

    // Update selection area when selection is started and pointer position changes
    useRefSignalEffect(() => {
        if (selectionStart.ref.current) {
            const pX = pointerPosition.ref.current.global.x;
            const pY = pointerPosition.ref.current.global.y;
            const sX = selectionStart.ref.current.x;
            const sY = selectionStart.ref.current.y;

            selectionArea.update({
                x: Math.min(sX, pX),
                y: Math.min(sY, pY),
                width: Math.abs(pX - sX),
                height: Math.abs(pY - sY)
            });
        }
    }, [selectionStart, pointerPosition]);

    // PIXI callback to draw the background grid
    const draw = useCallback((g: Graphics) => {
        const width = canvasRect.ref.current?.width ?? 0;
        const height = canvasRect.ref.current?.height ?? 0;

        g.clear();
        g.rect(0, 0, width, height);
        g.fill(backgroundFillSettings);

        const startOffset = 0;
        const startX = startOffset + (canvasPosition.ref.current.x % backgroundSettings.spacing);
        const startY = startOffset + (canvasPosition.ref.current.y % backgroundSettings.spacing);

        for (let x = startX; x < width; x += backgroundSettings.lineSpacing) {
            g.moveTo(x, 0);
            g.lineTo(x, height);
        }

        for (let y = startY; y < height; y += backgroundSettings.lineSpacing) {
            g.moveTo(0, y);
            g.lineTo(width, y);
        }

        g.stroke(BACKGROUND_LINE_STYLE);
    }, [backgroundFillSettings, backgroundSettings]);

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
            startSelection({...pointerPosition.ref.current.global});
        }
    }, [handlers.onPointerDown]);

    // PIXI callback to draw selection rectangle
    const drawSelection = useCallback((g: Graphics) => {
        g.clear();

        if (!selectionArea.ref.current) {
            return ;
        }

        g.rect(
            selectionArea.ref.current.x - (canvasRect.ref.current?.left ?? 0),
            selectionArea.ref.current.y - (canvasRect.ref.current?.top ?? 0),
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
        <FastGraphics draw={draw} drawDependencies={[canvasPosition, canvasRect]} />
        <FastGraphics draw={drawSelection} drawDependencies={[selectionArea]} />
    </pixiContainer>
}
