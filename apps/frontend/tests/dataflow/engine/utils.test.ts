import { jsonToMap, mapToJson } from '@dataflow-ui/engine/utils';
import { describe, it, expect } from 'vitest';

describe('jsonToMap()', () => {
  it('parses a valid JSON object string into a Map', () => {
    const json = '{"foo": "bar", "baz": 42}';
    const map = jsonToMap(json);

    expect(map instanceof Map).toBe(true);
    expect(map.size).toBe(2);
    expect(map.get('foo')).toBe('bar');
    expect(map.get('baz')).toBe(42);
  });

  it('returns an empty Map when input is null or undefined', () => {
    expect(jsonToMap(null).size).toBe(0);
    expect(jsonToMap(undefined).size).toBe(0);
  });

  it('handles empty object string "{}"', () => {
    const map = jsonToMap('{}');
    expect(map.size).toBe(0);
    expect(map instanceof Map).toBe(true);
  });

  it('infers value types if typed explicitly', () => {
    const json = '{"a":1,"b":2,"c":3}';
    const map = jsonToMap<number>(json);

    let total = 0;
    for (const val of map.values()) {
      total += val; // Type-safe: val is number
    }

    expect(total).toBe(6);
  });

  it('preserves non-primitive types correctly', () => {
    const original = {
      obj: { a: 1 },
      arr: [1, 2, 3],
      bool: true
    };

    const json = JSON.stringify(original);
    const map = jsonToMap(json);

    expect(map.get('obj')).toEqual({ a: 1 });
    expect(map.get('arr')).toEqual([1, 2, 3]);
    expect(map.get('bool')).toBe(true);
  });

  it('throws on invalid JSON', () => {
    const badJson = '{"foo": 1,, "bar": 2}';

    expect(() => jsonToMap(badJson)).toThrow(SyntaxError);
  });

  it('ignores prototype pollution keys', () => {
    const pollutedJson = '{"__proto__": {"polluted": true}, "safe": "yes"}';
    const map = jsonToMap(pollutedJson);

    expect(map.get('__proto__')).toEqual({ polluted: true });
    expect(map.get('safe')).toBe('yes');
    // @ts-ignore
    expect({}.polluted).toBeUndefined(); // Ensure pollution didn't happen
  });
});

describe('mapToJson()', () => {
  it('serializes a simple Map of string keys and values', () => {
    const map = new Map([
      ['a', 'apple'],
      ['b', 'banana']
    ]);

    const json = mapToJson(map);
    expect(json).toBe('{"a":"apple","b":"banana"}');
  });

  it('serializes a Map with mixed value types', () => {
    const map = new Map<string, unknown>([
      ['x', 42],
      ['y', true],
      ['z', [1, 2, 3]],
      ['w', { nested: 'yes' }]
    ]);

    const json = mapToJson(map);
    expect(JSON.parse(json)).toEqual({
      x: 42,
      y: true,
      z: [1, 2, 3],
      w: { nested: 'yes' }
    });
  });

  it('returns "{}" for an empty Map', () => {
    const empty = new Map();
    expect(mapToJson(empty)).toBe('{}');
  });

  it('handles special characters in keys', () => {
    // @ts-ignore
    const map = new Map([
      ['key with spaces', 1],
      ['🍕', 'pizza']
    ]);

    const json = mapToJson(map);
    expect(JSON.parse(json)).toEqual({
      'key with spaces': 1,
      '🍕': 'pizza'
    });
  });

  it('produces valid JSON regardless of value types', () => {
    // @ts-ignore
    const funky = new Map([
      ['nullVal', null],
      ['undef', undefined],
      ['func', () => 123],
      ['sym', Symbol('hi')],
    ]);

    const json = mapToJson(funky);
    // JSON.stringify omits undefined, functions, and symbols
    expect(json).toBe('{"nullVal":null}');
  });
});

