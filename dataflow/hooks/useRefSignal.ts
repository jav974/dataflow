import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
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
    readonly notifyUpdate: () => void;
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

    const notifyUpdate = useCallback(() => {
        lastUpdated.current = Date.now();
        notify();
    }, [notify]);

    const update = useCallback((value: T | null | undefined) => {
        if (ref.current !== value) {
            ref.current = value;
            notifyUpdate();
        }
    }, [ref, notifyUpdate]);

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
        notify,
        notifyUpdate
    }
}

/**
 * Triggers the specified callback upon depencency update, just like useEffect
 * but works with refSignals as well
 * 
 * @param refSignal 
 * @param callback 
 */
export function useRefSignalEffect(callback: React.EffectCallback, deps: React.DependencyList) {
    const lastCalled = useRef<number>(0);

    const handleCallback = useCallback(() => {
        const now = Date.now();
        
        // Avoid calling the same callback at same time
        // Happens when multiple refSignals among deps fire a notify at same time
        if (lastCalled.current != now) {
            callback();
            lastCalled.current = now;
        }
    }, [...deps]);

    useEffect(() => {
        deps.forEach((dep) => {
            if (isUseRefSignalReturn(dep)) dep.subscribe(handleCallback);
        });

        handleCallback();

        return () => {
            deps.forEach((dep) => {
                if (isUseRefSignalReturn(dep)) dep.unsubscribe(handleCallback);
            });
            lastCalled.current = 0;
        };
    }, [handleCallback]);
}

/**
 * Triggers re-render in component upon refSignal update
 * @param dependencies
 */
export function useRefSignalRender(dependencies: RefSignal<any>[]): void {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    useRefSignalEffect(forceUpdate, dependencies);
}

export function useRefSignalMemo<T>(factory: () => T, deps: React.DependencyList): RefSignal<T>;
export function useRefSignalMemo<T>(factory: () => T | null, deps: React.DependencyList): RefSignal<T | null>;
export function useRefSignalMemo<T>(factory: () => T | undefined, deps: React.DependencyList): RefSignal<T | undefined>;
export function useRefSignalMemo<T>(factory: () => T | null | undefined, deps: React.DependencyList): RefSignal<T | null | undefined> {
    const memo = useMemo<T | null | undefined>(factory, deps);
    const value = useRefSignal<T | null | undefined>(memo);

    useRefSignalEffect(() => {
        value.update(factory());
    }, deps);

    return value;
}

/**
 * Defer notifications of refSignals update to the end of callback function
 * @param dependencies 
 */
export function batch(callback: React.EffectCallback, dependencies: RefSignal<any>[]): void {
    batchStack.push(dependencies.map((dep) => dep.ref));
    callback();
    batchStack.pop();

    const lastUpdated = Date.now();

    dependencies.forEach((dep) => {
        dep.lastUpdated.current = lastUpdated;
        dep.notify();
    });
}
