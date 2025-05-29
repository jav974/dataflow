import { useCallback, useState } from "react";

type PersistedState<T> = [T, (value: T) => void];

function retrieveValue<T>(key: string, defaultValue: T | null | undefined): T | null | undefined {
    if (typeof sessionStorage === "undefined") {
        return defaultValue;
    }
    const storedValue = sessionStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
}

export function usePersistedState<T>(key: string, value: T): PersistedState<T>;
export function usePersistedState<T>(key: string, value: T | null): PersistedState<T | null>;
export function usePersistedState<T>(key: string, value: T | undefined): PersistedState<T | undefined>;

export function usePersistedState<T>(key: string, value: T | null | undefined): PersistedState<T | null | undefined> {
    const [state, setState] = useState<T | null | undefined>(retrieveValue<T>(key, value));

    const updateState = useCallback((value: T | null | undefined): void => {
        sessionStorage.setItem(key, JSON.stringify(value));
        setState(value);
    }, []);

    return [state, updateState];
}

export function useFetchPersistedState<T>(key: string, value?: T): T;
export function useFetchPersistedState<T>(key: string, value?: T | null): T | null;
export function useFetchPersistedState<T>(key: string, value?: T | undefined): T | undefined;

export function useFetchPersistedState<T>(key: string, value?: T | null | undefined): typeof value {
    return retrieveValue<T>(key, value);
}
