import executionContext, { KeyValue } from "./context";
import { NodeExecContext, NodeExecParams } from "./registry";
import { ExecutionGraph } from "./types";

export function jsonToMap<V = unknown>(json: string | null | undefined): Map<string, V> {
    const obj = JSON.parse(json ?? "{}");
    const map: Map<string, V> = new Map<string, V>();
    
    for (const [key, value] of Object.entries<V>(obj)) {
        map.set(key, value);
    }

    return map;
}

export function mapToJson<T = unknown>(map: Map<string, T>): string {
    return JSON.stringify(Object.fromEntries(map));
}

export function getValueByPath<T>(obj: T, path: string): unknown {
    return path
        .replace(/\[(["']?)([^"\]]+)\1\]/g, '.$2') // Convert bracket notation to dot notation while handling quoted keys
        .split('.')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .reduce((acc: any, key: string) => acc && acc[key], obj);
}

export function setValueByPath(obj: Record<string, any> | Map<string, any>, path: string, value: any): void {
    const keys = path
        .replace(/\[(["']?)([^"\]]+)\1\]/g, '.$2') // Convert bracket notation to dot notation
        .split('.');

    let current: any = obj;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const isLast = i === keys.length - 1;

        const get = (container: any, k: string) =>
            container instanceof Map ? container.get(k) : container[k];

        const set = (container: any, k: string, val: any) =>
            container instanceof Map ? container.set(k, val) : (container[k] = val);

        if (isLast) {
            set(current, key, value);
        } else {
            let next = get(current, key);

            if (!(next instanceof Map) && (typeof next !== 'object' || next === null)) {
                // Create next container as same type as current
                next = current instanceof Map ? new Map<string, any>() : {};
                set(current, key, next);
            }

            current = get(current, key);
        }
    }
}

export function filterObject(obj: object, filteredValue: unknown): object {
    // Remove undefined values
    return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => value !== filteredValue)
    );
}

export function getIOValues(executionGraph: ExecutionGraph, values: Map<string, unknown> = new Map()): Map<string, unknown> {
    let iterator: ExecutionGraph | null = executionGraph;

    while (iterator) {
        iterator.outputs.forEach(output => values.set(`${output.nodeId}:${output.outputId}`, output.value));
        iterator.inputs.forEach(input => {
            let value = input.defaultValue;

            if (input.resolve) {
                const output = input.resolve.graph.outputs.find(output => output.outputId === input.resolve?.src.pin);
                value = output?.value ?? input.defaultValue;
            }

            values.set(`${input.nodeId}:${input.inputId}`, value);

            if (input.resolve && !values.has(input.resolve.src.id + ':' + input.resolve.src.pin)) {
                values = getIOValues(input.resolve.graph, values);
            }
        });

        iterator.branches.forEach(branch => {
            if (branch.graph) {
                values = getIOValues(branch.graph, values);
            }
        });

        iterator = iterator.next;
    }

    return values;
}

export function mapToKeyValue(map: Map<string, unknown>): KeyValue {
    const keyValue: KeyValue = {};

    for (const [key, value] of map) {
        keyValue[key] = value;
    }

    return keyValue;
}

export function keyValueToMap(keyValue: KeyValue): Map<string, unknown> {
    const map: Map<string, unknown> = new Map();

    for (const key in keyValue) {
        map.set(key, keyValue[key]);
    }

    return map;
}

export function destructure(
    prefix: string | undefined,
    obj: Map<string, any> | Record<string, any>,
    keys: Map<string, string>,
    dst: Map<string, any>
): void {
    for (const [dstKey, rawPath] of keys.entries()) {
        let path = rawPath;

        // If prefix is set, ensure path starts with prefix + '.'
        if (prefix) {
            const prefixDot = prefix + '.';
            if (!path.startsWith(prefixDot)) {
                continue; // skip this key if prefix doesn't match
            }
            path = path.slice(prefixDot.length); // remove the prefix
        }

        const value = getValueByPath(obj, path);
        dst.set(dstKey, value);
    }
}

export function createVariable(type: string, inputs?: NodeExecParams, prefix?: string): KeyValue {
    const graphType = executionContext.types[type];
    const variable: KeyValue = {};

    if (!graphType) {
        console.log(`Type '${type}' not found`);
        return variable;
    };

    const unprefixedInputs: NodeExecParams = new Map();
    inputs?.forEach((value, key) => {
        if (!prefix) {
            unprefixedInputs.set(key, value);
        } else if (key.startsWith(prefix)) {
            unprefixedInputs.set(key.slice(prefix.length + 1), value);
        }
    });

    graphType.properties.forEach(property => {
        if (unprefixedInputs.has(property.id)) {
            variable[property.name] = unprefixedInputs.get(property.id);
        }
    });

    unprefixedInputs.forEach((value, key) => {
        const type = graphType.properties.find(prop => prop.id === key);

        if (!type) {
            const splittedType = key.split('_');
            const baseType = graphType.properties.find(prop => prop.id === splittedType[0]);

            if (baseType) {
                const newPrefix = prefix ? prefix + '_' + baseType.id : baseType.id;
                variable[baseType.name] = createVariable(baseType.type, inputs, newPrefix);
            }
        } else if (!variable[type.name]) {
            variable[type.name] = value;
        }
    });

    return variable;
}

export function appendResult(key: string, value: any, context: NodeExecContext, prefix: string | undefined = undefined, result: NodeExecParams = new Map()): NodeExecParams {
    const outputMap = context.get('_outputMap') as Map<string, string>;

    if (outputMap.has(key)) {
        result.set(key, value);
    } else {
        destructure(prefix, value, outputMap, result);
    }

    return result;
}

export class Stack<T> {
    items: T[] = [];

    push(item: T): void {
        this.items.push(item);
    }

    pop(): T | undefined {
        return this.items.pop();
    }

    peek(): T | undefined {
        return this.isEmpty() ? undefined : this.items[this.size() - 1];
    }

    size(): number {
        return this.items.length;
    }

    isEmpty(): boolean {
        return this.size() === 0;
    }
    
    clear(): void {
        this.items = [];
    }
}
