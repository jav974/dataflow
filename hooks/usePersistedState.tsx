import { useCallback, useEffect, useState } from "react";

type PersistedState<T> = [T, (value: T) => void];

function retrieveValue<T>(key: string, defaultValue: T | null | undefined): T | null | undefined {
    if (typeof localStorage === "undefined") {
        return defaultValue;
    }
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
}

export function usePersistedState<T>(key: string, value: T): PersistedState<T>;
export function usePersistedState<T>(key: string, value: T | null): PersistedState<T | null>;
export function usePersistedState<T>(key: string, value: T | undefined): PersistedState<T | undefined>;

export function usePersistedState<T>(key: string, value: T | null | undefined): PersistedState<T | null | undefined> {
    const [state, setState] = useState<T | null | undefined>(retrieveValue<T>(key, value));

    useEffect(() => {
        //setState(retrieveValue<T>(key, value));

        return () => {
            localStorage.removeItem(key);
        };
    }, []);

    const updateState = useCallback((value: T | null | undefined): void => {
        localStorage.setItem(key, JSON.stringify(value));
        setState(value);
    }, []);

    return [state, updateState];
}
