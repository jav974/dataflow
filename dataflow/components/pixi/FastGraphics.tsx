import { useRefSignalEffect } from "react-refsignal";
import { PixiReactElementProps, useExtend } from "@pixi/react";
import { Graphics } from "pixi.js";
import { useCallback, useRef } from "react";

interface FastGraphicsProps extends PixiReactElementProps<typeof Graphics> {
    drawDependencies?: any[];
}

export default function FastGraphics({draw, drawDependencies, ...props}: FastGraphicsProps) {
    useExtend({Graphics});

    const graphicsRef = useRef<Graphics>(null);
    const emptyDraw = useCallback(() => {}, []);
    
    useRefSignalEffect(() => {
        const g = graphicsRef.current;
        
        if (g) {
            draw(g);
        }
    }, [draw, ...(drawDependencies || [])]);

    return (
        <pixiGraphics 
            ref={graphicsRef}
            {...props} 
            draw={emptyDraw} 
        />
    );
}
