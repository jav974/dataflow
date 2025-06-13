import { KeyValue } from "./context";
import { ExecutionGraph } from "./types";

export function jsonToMap<V = any>(json: string | null | undefined) {
    const obj = JSON.parse(json ?? "{}");
    const map: Map<string, V> = new Map<string, V>();
    
    for (const [key, value] of Object.entries<V>(obj)) {
        map.set(key, value);
    }

    return map;
}

export function getValueByPath<T>(obj: T, path: string): unknown {
    return path
        .replace(/\[(["']?)([^"\]]+)\1\]/g, '.$2') // Convert bracket notation to dot notation while handling quoted keys
        .split('.')
        .reduce((acc: any, key: string) => acc && acc[key], obj);
}

export function filterObject(obj: object, filteredValue: unknown): object {
    // Remove undefined values
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== filteredValue)
    );
}

export function getIOValues(executionGraph: ExecutionGraph, values: Map<string, any> = new Map()): Map<string, any> {
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

export function mapToKeyValue(map: Map<string, any>): KeyValue {
    const keyValue: KeyValue = {};

    for (const [key, value] of map) {
        keyValue[key] = value;
    }

    return keyValue;
}

export function keyValueToMap(keyValue: KeyValue): Map<string, any> {
    const map: Map<string, any> = new Map();

    for (const key in keyValue) {
        map.set(key, keyValue[key]);
    }

    return map;
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
