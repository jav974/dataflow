import { useCallback, useMemo, useRef } from 'react';

export interface GraphCommand {
    redo: () => void;
    undo: () => void;
}

export interface UseHistoryReturn<T> {
    undo: () => void;
    redo: () => void;
    push: (next: T) => void;
    lock: () => void;
    unlock: () => void;
}

export function useHistory<T extends GraphCommand>(): UseHistoryReturn<T> {
    const past = useRef<T[]>([]);
    const future = useRef<T[]>([]);
    const locked = useRef<boolean>(false);

    const lock = useCallback(() => {
        locked.current = true;
    }, []);

    const unlock = useCallback(() => {
        locked.current = false;
    }, []);

    const push = useCallback((next: T) => {
        // Do not update history when locked
        if (!locked.current) {
            past.current.push(next);
        }

        // Erase future history
        future.current = [];

        const alreadyLocked = locked.current;
        lock();
        next.redo();
        if (!alreadyLocked) unlock();
    }, [lock, unlock]);

    const undo = useCallback(() => {
        if (past.current.length === 0) return;
        const previous = past.current.pop()!;

        // Do not update history when locked
        if (previous && !locked.current) {
            future.current.push(previous);
        }

        const alreadyLocked = locked.current;
        lock();
        previous.undo();
        if (!alreadyLocked) unlock();
    }, [lock, unlock]);

    const redo = useCallback(() => {
        if (future.current.length === 0) return;
        const next = future.current.pop()!;

        // Do not update history when locked
        if (next && !locked.current) {
            past.current.push(next);
        }

        const alreadyLocked = locked.current;
        lock();
        next.redo();
        if (!alreadyLocked) unlock();
    }, [lock, unlock]);

    return useMemo(() => ({
        undo,
        redo,
        push,
        lock,
        unlock
    }), [undo, redo, push, lock, unlock]);
}
