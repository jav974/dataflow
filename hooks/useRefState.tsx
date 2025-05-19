import React, { useCallback, useRef, useState } from "react";

export interface RefState<T> {
    readonly ref: React.RefObject<T>;
    readonly lastUpdated: number;
    update: (value: T) => void;
    setLastUpdated: (lastUpdated: number) => void;
}

export function useRefState<T>(initialValue: T): RefState<T>;
export function useRefState<T>(initialValue: T | null): RefState<T | null>;
export function useRefState<T>(initialValue: T | undefined): RefState<T | undefined>;

export function useRefState<T>(initialValue: T | null | undefined): RefState<T | null | undefined> {
    const ref = useRef<T | null | undefined>(initialValue);
    const [lastUpdated, setLastUpdated] = useState<number>(0);
    const update = useCallback((value: T | null | undefined): void => {
        ref.current = value;
        setLastUpdated(Date.now());
    }, []);

    return {
        ref,
        lastUpdated,
        update,
        setLastUpdated
    };
}
