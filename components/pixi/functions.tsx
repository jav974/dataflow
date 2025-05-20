import { Graphics } from "pixi.js";

const DISTANCE_THRESHOLD = 60;

export function getDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

export function drawBezierCurve(g: Graphics, from: { x: number, y: number }, to: { x: number, y: number }) {
    g.moveTo(from.x, from.y);

    const distance = getDistance(from.x, from.y, to.x, to.y);

    let offset = distance * 0.5;

    if (offset > DISTANCE_THRESHOLD) {
        offset = DISTANCE_THRESHOLD;
    }

    g.bezierCurveTo(
        from.x + offset,
        from.y,
        to.x - offset,
        to.y,
        to.x,
        to.y
    );
}
