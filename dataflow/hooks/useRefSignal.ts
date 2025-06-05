import React, { useCallback, useEffect, useReducer, useRef } from "react";
import { Stack } from "../engine/utils";

type Listener<T> = (value: T) => void;
const listenersMap = new WeakMap<object, Set<Listener<any>>>();
const batchStack = new Stack<React.RefObject<unknown>[]>();

export interface RefSignal<T = unknown> {
    readonly ref: React.RefObject<T>;
    readonly lastUpdated: React.RefObject<number>;
    readonly subscribe: (listener: Listener<T>) => void;
    readonly unsubscribe: (listener: Listener<T>) => void;
    readonly update: (value: T) => void;
    readonly notify: () => void;
}

function isUseRefSignalReturn<T>(obj: any): obj is RefSignal<T> {
    return (
        obj &&
        typeof obj.ref === "object" &&
        typeof obj.subscribe === "function" &&
        typeof obj.unsubscribe === "function" &&
        typeof obj.update === "function" &&
        typeof obj.notify === "function"
    );
}

/**
 * Provides a ref object containing value, and methods to subscribe to data updates
 * Data must be updated through update() method in order to invoke listeners
 * Modifying the ref.current value directly will not trigger the listeners
 * Call notify() after modifying ref.current directly
 * @param value 
 */
export function useRefSignal<T>(value: T): RefSignal<T>;
export function useRefSignal<T>(value: T | null): RefSignal<T | null>;
export function useRefSignal<T>(value: T | undefined): RefSignal<T | undefined>;
export function useRefSignal<T>(value: T | null | undefined): RefSignal<T | null | undefined> {
    const ref = useRef<T | null | undefined>(value);
    const lastUpdated = useRef<number>(Date.now());

    const subscribe = useCallback((listener: Listener<T | null | undefined>) => {
        if (!listenersMap.has(ref)) {
            listenersMap.set(ref, new Set());
        }
        listenersMap.get(ref)?.add(listener);
    }, [ref]);

    const unsubscribe = useCallback((listener: Listener<T | null | undefined>) => {
        const listeners = listenersMap.get(ref);
        
        if (listeners) {
            listeners.delete(listener);

            if (listeners.size === 0) {
                listenersMap.delete(ref); // Cleanup if no listeners remain
            }
        }
    }, [ref]);

    const notify = useCallback(() => {
        if (!batchStack.peek()?.includes(ref)) {
            listenersMap.get(ref)?.forEach((listener) => listener(ref.current));
        }
    }, [ref]);

    const update = useCallback((value: T | null | undefined) => {
        if (ref.current !== value) {
            ref.current = value;
            lastUpdated.current = Date.now();
            notify();
        }
    }, [ref, notify]);

    useEffect(() => {
        return () => {
            listenersMap.delete(ref);
        };
    }, [ref]);

    return {
        ref,
        lastUpdated,
        subscribe,
        unsubscribe,
        update,
        notify
    }
}

/**
 * Triggers the specified callback upon depencency update, just like useEffect
 * but works with refSignals as well
 * 
 * @param refSignal 
 * @param callback 
 */
export function useRefSignalEffect(callback: React.EffectCallback, dependencies: React.DependencyList) {
    useEffect(() => {
        dependencies.forEach((dep) => {
            if (isUseRefSignalReturn(dep)) dep.subscribe(callback);
        });

        callback();

        return () => {
            dependencies.forEach((dep) => {
                if (isUseRefSignalReturn(dep)) dep.unsubscribe(callback);
            });
        };
    }, [...dependencies, callback]);
}

/**
 * Triggers re-render in component upon refSignal update
 * @param dependencies
 */
export function useRefSignalRender(dependencies: RefSignal<any>[]): void {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    useRefSignalEffect(forceUpdate, dependencies);
}

/**
 * Defer notifications of refSignals update to the end of callback function
 * @param dependencies 
 */
export function batch(callback: React.EffectCallback, dependencies: RefSignal<any>[]): void {
    batchStack.push(dependencies.map((dep) => dep.ref));
    callback();
    batchStack.pop();

    dependencies.forEach((dep) => {
        dep.notify();
    });
}
