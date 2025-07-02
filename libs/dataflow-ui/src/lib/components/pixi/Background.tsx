import { useExtend } from '@pixi/react';
import { Container, FederatedPointerEvent, Graphics } from 'pixi.js';
import React, { useCallback, useMemo, useRef } from 'react';
import FastGraphics from './FastGraphics';
import useDraggable from '@dataflow-ui/hooks/useDraggable';
import { PointerEventType, useNodeContext } from '@dataflow-ui/contexts/NodeContext';
import { useGraphContext } from '@dataflow-ui/contexts/GraphContext';
import { BACKGROUND_LINE_STYLE, COLOR_BLUE } from '../../themes/style';
import { useRefSignalEffect } from 'react-refsignal';
import { useDashboardContext } from '@dataflow-ui/contexts/DashboardContext';

export default function Background() {
    useExtend({Container});

    const { canvasRect, pointerPosition } = useDashboardContext();
    const { scale, canvasPosition } = useGraphContext();
    const { position, handlers } = useDraggable(canvasPosition.current);
    const { onPointerUp, openContextMenu, selectionArea, selectionStart, startSelection, stopSelection } = useNodeContext();
    const prevScale = useRef<number>(scale.current);

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
        if (scale.lastUpdated > position.lastUpdated) {
            const scaleDelta = scale.current / prevScale.current;

            prevScale.current = scale.current;
            position.current = {
                x: position.current.x * scaleDelta,
                y: position.current.y * scaleDelta,
            };

            position.notify();
        }
    }, [scale]);

    // Update canvas position after background position changes
    useRefSignalEffect(() => {
        if (canvasPosition.lastUpdated !== position.lastUpdated) {
            canvasPosition.current = {
                x: position.current.x / scale.current,
                y: position.current.y / scale.current
            };
            canvasPosition.lastUpdated = position.lastUpdated;
            canvasPosition.notify();
        }
    }, [position]);

    // Reset background position according to canvas position external change
    useRefSignalEffect(() => {
        if (canvasPosition.lastUpdated !== position.lastUpdated) {
            position.current.x = canvasPosition.current.x;
            position.current.y = canvasPosition.current.y;
            position.lastUpdated = canvasPosition.lastUpdated;
        }
    }, [canvasPosition]);

    // Update selection area when selection is started and pointer position changes
    useRefSignalEffect(() => {
        if (selectionStart.current) {
            const pX = pointerPosition.current.global.x;
            const pY = pointerPosition.current.global.y;
            const sX = selectionStart.current.x;
            const sY = selectionStart.current.y;

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
        const width = canvasRect.current?.width ?? 0;
        const height = canvasRect.current?.height ?? 0;

        g.clear();
        g.rect(0, 0, width, height);
        g.fill(backgroundFillSettings);

        const startOffset = 0;
        const startX = startOffset + (Math.round(canvasPosition.current.x ) % backgroundSettings.lineSpacing);
        const startY = startOffset + (Math.round(canvasPosition.current.y ) % backgroundSettings.lineSpacing);

        for (let x = startX; x < width; x += backgroundSettings.lineSpacing) {
            g.moveTo(x, 0);
            g.lineTo(x, height);
        }

        for (let y = startY; y < height; y += backgroundSettings.lineSpacing) {
            g.moveTo(0, y);
            g.lineTo(width, y);
        }

        g.stroke(BACKGROUND_LINE_STYLE);
    }, [backgroundFillSettings, backgroundSettings, canvasPosition, canvasRect]);

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
    }, [onPointerUp, selectionStart, handlers, stopSelection]);

    // Either move the canvas or start selection rectangle on pointer down
    const handlePointerDown = useCallback((e: FederatedPointerEvent) => {
        if (e.ctrlKey) {    // Move canvas
            handlers.onPointerDown(e);
        } else {            // Create selection rectangle
            startSelection({...pointerPosition.current.global});
        }
    }, [handlers, pointerPosition, startSelection]);

    // PIXI callback to draw selection rectangle
    const drawSelection = useCallback((g: Graphics) => {
        g.clear();

        if (!selectionArea.current) {
            return ;
        }

        g.rect(
            selectionArea.current.x - (canvasRect.current?.left ?? 0),
            selectionArea.current.y - (canvasRect.current?.top ?? 0),
            selectionArea.current.width,
            selectionArea.current.height,
        );
        g.fill(selectionFillSettings);
    }, [selectionFillSettings, canvasRect, selectionArea]);

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
