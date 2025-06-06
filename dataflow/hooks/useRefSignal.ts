import React, { createRef, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
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
        typeof obj.lastUpdated === "object" &&
        typeof obj.subscribe === "function" &&
        typeof obj.unsubscribe === "function" &&
        typeof obj.update === "function" &&
        typeof obj.notify === "function" &&
        typeof obj.notifyUpdate === "function"
    );
}

function subscribe(ref: React.RefObject<unknown>, listener: Listener<any>): void{
    if (!listenersMap.has(ref)) {
        listenersMap.set(ref, new Set());
    }   
    listenersMap.get(ref)?.add(listener);
}

function unsubscribe(ref: React.RefObject<unknown>, listener: Listener<any>): void {
    const listeners = listenersMap.get(ref);
        
    if (listeners) {
        listeners.delete(listener);

        if (listeners.size === 0) {
            listenersMap.delete(ref); // Cleanup if no listeners remain
        }
    }
}

function notify(ref: React.RefObject<unknown>): void {
    if (!batchStack.peek()?.includes(ref)) {
        listenersMap.get(ref)?.forEach((listener) => listener(ref.current));
    }
}

function notifyUpdate(ref: React.RefObject<unknown>, lastUpdated: React.RefObject<number>): void {
    lastUpdated.current = Date.now();
    notify(ref);
}

function update(ref: React.RefObject<unknown>, value: unknown, lastUpdated: React.RefObject<number>) {
    if (ref.current !== value) {
        ref.current = value;
        notifyUpdate(ref, lastUpdated);
    }
}

export function createRefSignal<T = unknown>(initialValue: T): RefSignal<T> {
    const ref = createRef<T>() as React.RefObject<T>;
    const lastUpdated = createRef<number>() as React.RefObject<number>;

    ref.current = initialValue;
    lastUpdated.current = Date.now();

    return {
        ref,
        lastUpdated,
        subscribe: (listener: Listener<any>) => subscribe(ref, listener),
        unsubscribe: (listener: Listener<any>) => unsubscribe(ref, listener),
        notify: () => notify(ref),
        notifyUpdate: () => notifyUpdate(ref, lastUpdated),
        update: (value: T) => update(ref, value, lastUpdated)
    };
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
    const refSignal = useMemo(() => createRefSignal(value), []);

    useEffect(() => {
        return () => {
            listenersMap.delete(refSignal.ref);
        };
    }, [refSignal.ref]);

    return refSignal;
}

/**
 * Triggers the specified callback upon depencency update, just like useEffect
 * but works with refSignals as well
 * 
 * @param refSignal 
 * @param callback 
 */
export function useRefSignalEffect(callback: React.EffectCallback, deps: React.DependencyList) {
    const handleCallback = useCallback(() => {
        callback();
    }, deps);

    useEffect(() => {
        deps.forEach((dep) => {
            if (isUseRefSignalReturn(dep)) dep.subscribe(handleCallback);
        });

        handleCallback();

        return () => {
            deps.forEach((dep) => {
                if (isUseRefSignalReturn(dep)) dep.unsubscribe(handleCallback);
            });
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
