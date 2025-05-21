import { extend, PixiReactElementProps } from '@pixi/react';
import { DOMContainer } from 'pixi.js';
import useDraggable from '@/hooks/pixi/useDraggable';
import { useEffect, useState } from 'react';
import { useNodes } from '@/contexts/NodeContext';
import { NodeConfig } from '../config/Schema';

extend({
    DOMContainer
});

interface HtmlNodeProps extends PixiReactElementProps<typeof DOMContainer> {
    node: NodeConfig;
}

export default function HtmlNode({ node, ...props }: HtmlNodeProps) {
    const { position, handlers, lastUpdated: positionLastUpdated } = useDraggable(node.position);
    const [layout, setLayout] = useState<HTMLElement | undefined>(undefined);
    const { updateNodePosition, setRenderTarget, isSelected, selectedNodes, nodes } = useNodes();
    const [ selected, setSelected ] = useState<boolean>(false);
    
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

    useEffect(() => {
        updateNodePosition(node.id, position.x, position.y);
    }, [updateNodePosition, node.id, positionLastUpdated]);

    useEffect(() => {
        setSelected(isSelected(node.id));
    }, [node.id, selectedNodes.lastUpdated]);

    // Update the current position of useDraggable upon group selection drag
    // This is to ensure that next time we move a node that was part of a selection, we get it's current position
    // Otherwise the node would be briefly teleported to its former location (before selection move)
    useEffect(() => {
        if (selected) {
            position.x = node.position.x;
            position.y = node.position.y;
        }
    }, [node.id, selected, nodes.lastUpdated]);

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
