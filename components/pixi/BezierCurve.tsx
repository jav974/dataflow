import { useEffect } from "react";
import { MeshRope, Texture, PointData } from "pixi.js";
import { getBezierPoints } from "./functions";
import { PixiReactElementProps, useExtend } from "@pixi/react";
import { useRefState } from "@/hooks/useRefState";

interface BezierCurveProps extends Omit<PixiReactElementProps<typeof MeshRope>, "points" | "texture"> {
    from: PointData;
    to: PointData;
    controlPoints?: number;
    texture?: Texture;
}

export default function BezierCurve({from, to, controlPoints = 100, texture = Texture.WHITE, ...props}: BezierCurveProps) {
    useExtend({MeshRope});

    const points = useRefState<PointData[]>([]);

    // Initialize control points for the current line
    // It is important to make sure that the points ref remains unchanged as it is used as read buffer for pixi shader
    useEffect(() => {
        for (let i = 0; i < controlPoints; i++) {
            points.ref.current.push({x: 0, y: 0});
        }
        points.setLastUpdated(Date.now());
    }, []);

    // Update the points of the bezier curve when the from or to coordinates change
    useEffect(() => {
        const newPoints = getBezierPoints(from, to, controlPoints);

        for (let i = 0; i < newPoints.length; ++i) {
            points.ref.current[i].x = newPoints[i].x;
            points.ref.current[i].y = newPoints[i].y;
        }
    }, [from.x, from.y, to.x, to.y]);

    // If there are no points, do not render the curve, otherwise it will throw a memory error from pixi.js
    if (points.ref.current.length === 0) {
        return null;
    }

    return <pixiMeshRope
        {...props}
        texture={texture}
        points={points.ref.current}
    />
}
