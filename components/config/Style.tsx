import { FillGradient, type StrokeStyle } from "pixi.js";

const COLOR_BLUE = '#4a90e2';
const COLOR_BLUE_500 = '#3b82f6';
const COLOR_RED_500 = '#ef4444';
const COLOR_GREEN_500 = '#22c55e';
const COLOR_PURPLE_500 = '#a855f7';
const COLOR_PINK_500 = '#ec4899';

const baseStrokeStyle: StrokeStyle = {
    alpha: 1,
    alignment: 0.5,
    cap: 'round',
    join: 'round',
    miterLimit: 10,
}

const flowStrokeStyle: StrokeStyle = {
    color: COLOR_BLUE, 
    width: 6,
    ...baseStrokeStyle
};

const paramStrokeStyle: StrokeStyle = {
    color: COLOR_BLUE, 
    width: 4,
    ...baseStrokeStyle
}

const LINE_STYLE: StrokeStyle = { 
    ...flowStrokeStyle
    /*fill: new FillGradient({
        type: 'linear',
        start: {x: 0, y: 0},
        end: {x: 1, y: 1},
        colorStops: [
            { offset: 0, color: 'green' },
            { offset: 1, color: 'blue' }
        ]
    })*/
};

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

const LineStyle: Record<string, StrokeStyle> = {
    flow: flowStrokeStyle,
    boolean: {...paramStrokeStyle, color: COLOR_RED_500},
    number: {...paramStrokeStyle, color: COLOR_GREEN_500},
    string: {...paramStrokeStyle, color: COLOR_PINK_500},
    any: {...paramStrokeStyle, color: COLOR_BLUE_500},
    custom: {...paramStrokeStyle, color: COLOR_PURPLE_500},
};

export { LINE_STYLE, COLOR_BLUE, BACKGROUND_LINE_STYLE, PinStyle, LineStyle };
