import { FillGradient, type StrokeStyle } from "pixi.js";

const COLOR_BLUE = '#4a90e2';

const LINE_STYLE: StrokeStyle = { 
    color: COLOR_BLUE, 
    width: 4,
    alpha: 1,
    alignment: 0.5,
    cap: 'round',
    join: 'round',
    miterLimit: 10,
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

export { LINE_STYLE, COLOR_BLUE, BACKGROUND_LINE_STYLE };
