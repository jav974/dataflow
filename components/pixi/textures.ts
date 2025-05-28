import { Texture } from "pixi.js";
import { createColorTexture, createGradientTexture } from "./functions";
import { COLOR_BLUE, COLOR_BLUE_500, COLOR_GREEN_500, COLOR_PINK_500, COLOR_PURPLE_500, COLOR_RED_500 } from "../config/Style";

const LINE_THICKNESS_FLOW = 8;
const LINE_THICKNESS_PARAM = 6;

const LineTextures: Record<string, Texture | null> = {
    flow: createColorTexture(COLOR_BLUE, 1, LINE_THICKNESS_FLOW),
    boolean: createColorTexture(COLOR_RED_500, 1, LINE_THICKNESS_PARAM),
    number: createColorTexture(COLOR_GREEN_500, 1, LINE_THICKNESS_PARAM),
    string: createColorTexture(COLOR_PINK_500, 1, LINE_THICKNESS_PARAM),
    any: createColorTexture(COLOR_BLUE_500, 1, LINE_THICKNESS_PARAM),
    custom: createColorTexture(COLOR_PURPLE_500, 1, LINE_THICKNESS_PARAM),

    boolean_number: createGradientTexture(COLOR_RED_500, COLOR_GREEN_500, 100, LINE_THICKNESS_PARAM),
    boolean_string: createGradientTexture(COLOR_RED_500, COLOR_PINK_500, 100, LINE_THICKNESS_PARAM),
    boolean_any: createGradientTexture(COLOR_RED_500, COLOR_BLUE_500, 100, LINE_THICKNESS_PARAM),

    number_boolean: createGradientTexture(COLOR_GREEN_500, COLOR_RED_500, 100, LINE_THICKNESS_PARAM),
    number_string: createGradientTexture(COLOR_GREEN_500, COLOR_PINK_500, 100, LINE_THICKNESS_PARAM),
    number_any: createGradientTexture(COLOR_GREEN_500, COLOR_BLUE_500, 100, LINE_THICKNESS_PARAM),

    string_boolean: createGradientTexture(COLOR_PINK_500, COLOR_RED_500, 100, LINE_THICKNESS_PARAM),
    string_number: createGradientTexture(COLOR_PINK_500, COLOR_GREEN_500, 100, LINE_THICKNESS_PARAM),
    string_any: createGradientTexture(COLOR_PINK_500, COLOR_BLUE_500, 100, LINE_THICKNESS_PARAM),
};

export { LineTextures }
