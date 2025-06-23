'use client';

import { useCallback, useEffect, useRef } from 'react';
import { isEditableElement } from '../utils/utils';

type ClipboardPayload<T> = {
    kind: 'copy' | 'cut';
    type: 'partial-graph' | 'full-graph';
    data: T;
};

export function useClipboard<T>(onPaste: (payload: ClipboardPayload<T>) => void) {
    const clipboard = useRef<ClipboardPayload<T> | null>(null);
    const channelRef = useRef<BroadcastChannel | null>(null);
    const sourceId = useRef<string>(crypto.randomUUID()).current;

    // BroadcastChannel setup
    useEffect(() => {
        const channel = new BroadcastChannel('graph-clipboard');
        channelRef.current = channel;

        channel.onmessage = (e) => {
            const payload = e.data as ClipboardPayload<T> & { sourceId: string };
            if (payload.sourceId !== sourceId && payload.type === 'partial-graph') {
                clipboard.current = { type: 'partial-graph', data: payload.data, kind: payload.kind };
            }
        };

        return () => channel.close();
    }, [sourceId]);

    // System clipboard paste handler
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (isEditableElement(document.activeElement)) return ;

            const text = e.clipboardData?.getData('text/plain');
            if (!text) return;

            try {
                const parsed = JSON.parse(text) as ClipboardPayload<T>;
                if (parsed.type === 'full-graph') {
                    onPaste(parsed);
                }
            } catch {
                // Not valid JSON or not our format
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [onPaste]);

    const copyOrCutPartial = useCallback((data: T, kind: 'copy' | 'cut') => {
        const payload: ClipboardPayload<T> & { sourceId: string } = {
            type: 'partial-graph',
            data,
            sourceId,
            kind
        };
        channelRef.current?.postMessage(payload);
        clipboard.current = { type: 'partial-graph', data, kind };
    }, []);

    const copyPartial = useCallback((data: T) => {
        copyOrCutPartial(data, 'copy');
    }, [copyOrCutPartial]);

    const cutPartial = useCallback((data: T) => {
        copyOrCutPartial(data, 'cut');
    }, [copyOrCutPartial]);

    const paste = useCallback(() => {
        if (clipboard.current) {
            onPaste(clipboard.current);
        }
    }, [clipboard]);

    return {
        copyPartial,
        cutPartial,
        paste,
        hasClipboard: !!clipboard,
    };
}
