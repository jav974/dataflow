import { buildAdaptiveBezier, Graphics, Size, Texture } from "pixi.js";
import { Coordinates } from "../../config/schema";

const DISTANCE_THRESHOLD = 60;

export function getDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

export function drawBezierCurve(g: Graphics, from: Coordinates, to: Coordinates) {
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

function interpolatePoints(points: Coordinates[], segments: number): Coordinates[] {
    const interpolatedPoints: Coordinates[] = [];

    for (let i = 0; i < segments; i++) {
        const t = i / (segments - 1); // Normalize `t` between 0 and 1
        const indexFloat = t * (points.length - 1); // Get floating index
        const indexLow = Math.floor(indexFloat);
        const indexHigh = Math.min(indexLow + 1, points.length - 1);
        const ratio = indexFloat - indexLow; // Fractional part for interpolation

        // Interpolated X & Y
        const x = points[indexLow].x * (1 - ratio) + points[indexHigh].x * ratio;
        const y = points[indexLow].y * (1 - ratio) + points[indexHigh].y * ratio;

        interpolatedPoints.push({ x, y });
    }

    return interpolatedPoints;
}

export function getBezierPoints(from: Coordinates, to: Coordinates, segments?: number, smoothness?: number): Coordinates[] {
    let points: number[] = [];
    const distance = getDistance(from.x, from.y, to.x, to.y);
    let offset = Math.min(distance * 0.5, DISTANCE_THRESHOLD);

    points = buildAdaptiveBezier(
        points,
        from.x, from.y, // Start point
        from.x + offset, from.y, // First control point
        to.x - offset, to.y, // Second control point
        to.x, to.y, // End point
        smoothness
    );

    let ret: Coordinates[] = [];

    if (segments === undefined || segments >= points.length) {
        for (let i = 0; i < points.length; i += 2) {
            ret.push({x: points[i], y: points[i + 1]});
        }

        if (segments === undefined || segments === points.length) {
            return ret;
        }

        ret = interpolatePoints(ret, segments);
        ret[0] = {...from};
        ret[ret.length - 1] = {...to};

        return ret;
    }

    const totalPoints = points.length / 2;

    for (let i = 0; i < segments; i++) {
        const index = Math.floor((i / (segments - 1)) * (totalPoints - 1)) * 2;
        ret.push({ x: points[index], y: points[index + 1] });
    }

    return ret;
}

export function isOverlapping(rect1: Coordinates & Size, rect2: Coordinates & Size): boolean {
    return !(rect1.x + rect1.width < rect2.x || 
             rect2.x + rect2.width < rect1.x || 
             rect1.y + rect1.height < rect2.y || 
             rect2.y + rect2.height < rect1.y);
}

export function getCanvasAnd2DContext(width: number, height: number): [HTMLCanvasElement | null, CanvasRenderingContext2D | null] {
    if (typeof window === "undefined") {
        return [null, null];
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    return [canvas, ctx];
}

function hexToRGBA(hex: string, alpha: number = 1): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function createColorTexture(color: string, width = 1, height = 1): Texture | null {
    const [canvas, ctx] = getCanvasAnd2DContext(width, height);

    if (!canvas || !ctx) {
        return null;
    }

    const transparent = hexToRGBA(color, 0);
    const opaque = hexToRGBA(color, 1);
    const gradient = ctx.createLinearGradient(0, 0, 0, height);

    gradient.addColorStop(0, transparent);  // Top edge (transparent)
    gradient.addColorStop(0.3, opaque); // Near top (opaque)
    gradient.addColorStop(0.7, opaque); // Near bottom (opaque)
    gradient.addColorStop(1, transparent);  // Bottom edge (transparent)

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return Texture.from(canvas);
}

export function createGradientTexture(colorStart: string, colorEnd: string, width = 100, height = 100): Texture | null {
    const [colorCanvas, colorCtx] = getCanvasAnd2DContext(width, height);
    const [alphaCanvas, alphaCtx] = getCanvasAnd2DContext(width, height);

    if (!colorCanvas || !colorCtx || !alphaCanvas || !alphaCtx) {
        return null;
    }

    // Create a linear gradient
    const colorGradient = colorCtx.createLinearGradient(0, 0, width, 0);
    colorGradient.addColorStop(0, colorStart); // Start color
    colorGradient.addColorStop(1, colorEnd);   // End color

    // Fill the canvas with the gradient
    colorCtx.fillStyle = colorGradient;
    colorCtx.fillRect(0, 0, colorCanvas.width, colorCanvas.height);

    const transparent = "rgba(0, 0, 0, 0)";
    const opaque = "rgba(0, 0, 0, 1)";
    const alphaGradient = alphaCtx.createLinearGradient(0, 0, 0, alphaCanvas.height);

    alphaGradient.addColorStop(0, transparent);  // Top edge (transparent)
    alphaGradient.addColorStop(0.3, opaque); // Near top (opaque)
    alphaGradient.addColorStop(0.7, opaque); // Near bottom (opaque)
    alphaGradient.addColorStop(1, transparent);  // Bottom edge (transparent)

    alphaCtx.fillStyle = alphaGradient;
    alphaCtx.fillRect(0, 0, alphaCanvas.width, alphaCanvas.height);

    // Apply the alpha mask using `globalCompositeOperation`
    colorCtx.globalCompositeOperation = "destination-in";
    colorCtx.drawImage(alphaCanvas, 0, 0);

    // Reset globalCompositeOperation for further drawings
    colorCtx.globalCompositeOperation = "source-over";

    return Texture.from(colorCanvas);
}
