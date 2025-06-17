import { useEffect } from "react";
import { MeshRope, Texture, PointData } from "pixi.js";
import { getBezierPoints } from "./functions";
import { PixiReactElementProps, useExtend } from "@pixi/react";
import { useRefState } from "@/dataflow/hooks/useRefState";
import { RefSignal, useRefSignalEffect, useRefSignalMemo } from "react-refsignal";
import { isRefSignal } from "react-refsignal/dist/refsignal";

interface BezierCurveProps extends Omit<PixiReactElementProps<typeof MeshRope>, "points" | "texture"> {
    from: PointData | RefSignal<PointData>;
    to: PointData | RefSignal<PointData>;
    controlPoints?: number;
    texture?: Texture;
}

export default function BezierCurve({from, to, controlPoints = 100, texture = Texture.WHITE, ...props}: BezierCurveProps) {
    useExtend({MeshRope});

    const points = useRefState<PointData[]>([]);
    const fromCoord = useRefSignalMemo(() => isRefSignal<PointData>(from) ? from.current : from, [from]);
    const toCoord = useRefSignalMemo(() => isRefSignal<PointData>(to) ? to.current : to, [to]);

    // Initialize control points for the current line
    // It is important to make sure that the points ref remains unchanged as it is used as read buffer for pixi shader
    useEffect(() => {
        for (let i = 0; i < controlPoints; i++) {
            points.current.push({x: 0, y: 0});
        }
        points.notifyUpdate();
    }, [controlPoints, points]);

    // Update the points of the bezier curve when the from or to coordinates change
    useRefSignalEffect(() => {
        const newPoints = getBezierPoints(fromCoord.current, toCoord.current, controlPoints);

        for (let i = 0; i < newPoints.length; ++i) {
            points.current[i].x = newPoints[i].x;
            points.current[i].y = newPoints[i].y;
        }
    }, [fromCoord, toCoord, controlPoints, points]);

    // If there are no points, do not render the curve, otherwise it will throw a memory error from pixi.js
    if (points.current.length === 0) {
        return null;
    }

    return <pixiMeshRope
        {...props}
        texture={texture}
        points={points.current}
    />
}
