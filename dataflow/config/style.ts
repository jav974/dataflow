import { type StrokeStyle } from "pixi.js";

const COLOR_BLUE = '#4a90e2';
const COLOR_BLUE_500 = '#3b82f6';
const COLOR_RED_500 = '#ef4444';
const COLOR_GREEN_500 = '#22c55e';
const COLOR_PURPLE_500 = '#a855f7';
const COLOR_PINK_500 = '#ec4899';

const BACKGROUND_LINE_STYLE: StrokeStyle = {
    color: 0, 
    width: 0.25,
    alpha: 0.5,
    alignment: 0.5,
    cap: 'round',
    join: 'round',
    miterLimit: 10,
};

interface PinState {
    connectedClass: string;
    disconnectedClass: string;
}

const PinStyle: Record<string, PinState> = {
    boolean: {
        connectedClass: 'bg-red-500',
        disconnectedClass: 'border-red-500'
    },
    number: {
        connectedClass: 'bg-green-500',
        disconnectedClass: 'border-green-500'
    },
    string: {
        connectedClass: 'bg-pink-500',
        disconnectedClass: 'border-pink-500'
    },
    any: {
        connectedClass: 'bg-blue-500',
        disconnectedClass: 'border-blue-500'
    },
    custom: {
        connectedClass: 'bg-purple-500',
        disconnectedClass: 'border-purple-500'
    }
};

export { COLOR_BLUE, COLOR_BLUE_500, COLOR_GREEN_500, COLOR_PINK_500, COLOR_PURPLE_500, COLOR_RED_500, BACKGROUND_LINE_STYLE, PinStyle };
