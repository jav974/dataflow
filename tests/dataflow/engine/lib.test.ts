import { isNumeric, math_add, math_div, math_mod, math_mul, math_sub } from "@/dataflow/engine/lib";
import { describe, expect, it } from "vitest";

describe('isNumeric()', () => {
  it('returns true for numeric strings and numbers', () => {
    expect(isNumeric(42)).toBe(true);
    expect(isNumeric('42')).toBe(true);
    expect(isNumeric('3.14')).toBe(true);
  });

  it('returns false for non-numeric values', () => {
    expect(isNumeric(NaN)).toBe(false);
    expect(isNumeric(undefined)).toBe(false);
    expect(isNumeric('hello')).toBe(false);
    expect(isNumeric({})).toBe(false);
  });
});

describe('math_add()', () => {
  it('adds all numbers correctly', () => {
    expect(math_add(1, 2, 3)).toBe(6);
    expect(math_add()).toBe(0);
  });
});

describe('math_mul()', () => {
  it('multiplies all numbers correctly', () => {
    expect(math_mul(2, 3, 4)).toBe(24);
    expect(math_mul()).toBe(1);
  });
});

describe('math_sub()', () => {
  it('subtracts in order from left to right', () => {
    expect(math_sub(10, 2, 3)).toBe(5);
  });
});

describe('math_div()', () => {
  it('divides in order from left to right', () => {
    expect(math_div(100, 2, 5)).toBe(10);
  });
});

describe('math_mod()', () => {
  it('applies modulo in order from left to right', () => {
    expect(math_mod(100, 30, 4)).toBe(2);
  });
});
