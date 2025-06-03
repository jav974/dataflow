import React, { useCallback, useEffect, useReducer, useRef } from "react";

type Listener<T> = (value: T) => void;
const listenersMap = new WeakMap<object, Set<Listener<any>>>();

export interface UseRefSignalReturn<T = unknown> {
    readonly ref: React.RefObject<T>;
    readonly subscribe: (listener: Listener<T>) => void;
    readonly unsubscribe: (listener: Listener<T>) => void;
    readonly update: (value: T) => void;
    readonly notify: () => void;
}

function isUseRefSignalReturn<T>(obj: any): obj is UseRefSignalReturn<T> {
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
export function useRefSignal<T>(value: T): UseRefSignalReturn<T>;
export function useRefSignal<T>(value: T | null): UseRefSignalReturn<T | null>;
export function useRefSignal<T>(value: T | undefined): UseRefSignalReturn<T | undefined>;
export function useRefSignal<T>(value: T | null | undefined): UseRefSignalReturn<T | null | undefined> {
    const ref = useRef<T | null | undefined>(value);

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
        listenersMap.get(ref)?.forEach((listener) => listener(ref.current));
    }, [ref]);

    const update = useCallback((value: T | null | undefined) => {
        if (ref.current !== value) {
            ref.current = value;
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
export function useRefSignalRender<T = unknown>(dependencies: UseRefSignalReturn<T>[]): void {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    useRefSignalEffect(forceUpdate, dependencies);
}
