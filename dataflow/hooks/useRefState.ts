import React, { useCallback, useReducer, useRef } from "react";

export interface RefState<T = unknown> extends React.RefObject<T> {
    lastUpdated: number;
    readonly update: (value: T) => void;
    readonly notify: () => void;
    readonly notifyUpdate: () => void;
}

export function useRefState<T>(initialValue: T): RefState<T>;
export function useRefState<T>(initialValue: T | null): RefState<T | null>;
export function useRefState<T>(initialValue: T | undefined): RefState<T | undefined>;

export function useRefState<T>(initialValue: T | null | undefined): RefState<T | null | undefined> {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    const notify = useCallback(() => {
        forceUpdate();
    }, []);
    
    const notifyUpdate = useCallback(() => {
        ref.current.lastUpdated = Date.now();
        notify();
    }, [notify]);

    const update = useCallback((value: T | null | undefined): void => {
        ref.current.current = value;
        notifyUpdate();
    }, [notifyUpdate]);

    const ref = useRef<RefState<T | null | undefined>>({
        current: initialValue,
        lastUpdated: 0,
        update,
        notify,
        notifyUpdate
    });
    
    return ref.current;
}
