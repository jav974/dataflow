import { useExtend } from '@pixi/react';
import { Container, FederatedPointerEvent, Graphics } from 'pixi.js';
import React, { useCallback, useEffect, useMemo } from 'react';
import FastGraphics from './FastGraphics';
import useDraggable from '@/dataflow/hooks/useDraggable';
import { PointerEventType, useNodes } from '@/dataflow/contexts/NodeContext';
import { useGraphContext } from '@/dataflow/contexts/GraphContext';
import { BACKGROUND_LINE_STYLE, COLOR_BLUE } from '../../config/style';
import { useDashboardContext } from '@/dataflow/contexts/DashboardContext';
import { useSignal, useSignalEffect } from '@preact/signals-react';
import { Coordinates } from '@/dataflow/config/schema';

export default function Background() {
    useExtend({Container});

    const { viewPortSize: {width, height}, viewPortRectRef, pointerPositionSignal } = useDashboardContext();
    const { scale, canvasPosition } = useGraphContext();
    const { position, lastUpdated: positionLastUpdated, handlers } = useDraggable(canvasPosition.ref.current);
    const { onPointerUp, openContextMenu, selectionArea, selectionStart, startSelection, stopSelection } = useNodes();
    const selectionStartSignal = useSignal<Coordinates | undefined>(undefined);

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

    // Update canvas position after background position or scale changes
    useEffect(() => {
        canvasPosition.ref.current = { x: position.x / scale.value, y: position.y / scale.value };
        canvasPosition.setLastUpdated(positionLastUpdated);
    }, [positionLastUpdated, scale.value]);

    // Reset background position according to canvas position external change
    useEffect(() => {
        if (canvasPosition.lastUpdated > positionLastUpdated) {
            position.x = canvasPosition.ref.current.x;
            position.y = canvasPosition.ref.current.y;
        }
    }, [canvasPosition.lastUpdated, positionLastUpdated]);

    // Update selection area when selection is started and pointer position changes
    useEffect(() => {
        selectionStartSignal.value = selectionStart;
    }, [selectionStart]);

    useSignalEffect(() => {
        if (selectionStartSignal.value) {
            const pointerPosition = pointerPositionSignal.value.viewport;
            const {x, y} = selectionStartSignal.value;

            selectionArea.update({
                x: Math.min(x, pointerPosition.x),
                y: Math.min(y, pointerPosition.y),
                width: Math.abs(pointerPosition.x - x),
                height: Math.abs(pointerPosition.y - y)
            });
        }
    });

    // PIXI callback to draw the background grid
    const draw = useCallback((g: Graphics) => {
        g.clear();
        g.rect(0, 0, width, height);
        g.fill(backgroundFillSettings);

        const startOffset = 0;
        const startX = startOffset + ((canvasPosition.ref.current.x / scale.value) % backgroundSettings.spacing);
        const startY = startOffset + ((canvasPosition.ref.current.y / scale.value) % backgroundSettings.spacing);

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
        } else {            // Create selection rectangle (viewport coordinates)
            startSelection({
                x: e.clientX - (viewPortRectRef.current?.left ?? 0),
                y: e.clientY - (viewPortRectRef.current?.top ?? 0)
            });
        }
    }, [handlers.onPointerDown]);

    // PIXI callback to draw selection rectangle
    const drawSelection = useCallback((g: Graphics) => {
        g.clear();

        if (!selectionStart || !selectionArea.ref.current) {
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
        <FastGraphics draw={draw} drawDependencies={[canvasPosition.lastUpdated]} />
        <FastGraphics draw={drawSelection} drawDependencies={[selectionArea.lastUpdated]} />
    </pixiContainer>
}
