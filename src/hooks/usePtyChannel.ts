import { useEffect, useRef, useCallback } from 'react';
import { Channel } from '@tauri-apps/api/core';
import type { PtyOutputEvent } from '../lib/types';

interface UsePtyChannelOptions {
    onData: (data: Uint8Array) => void;
    onExit: (exitCode: number | null) => void;
    onError: (message: string) => void;
}

export function usePtyChannel({ onData, onExit, onError }: UsePtyChannelOptions) {
    const channelRef = useRef<Channel<PtyOutputEvent> | null>(null);
    const callbacksRef = useRef({ onData, onExit, onError });
    callbacksRef.current = { onData, onExit, onError };

    const getChannel = useCallback(() => {
        if (!channelRef.current) {
            const channel = new Channel<PtyOutputEvent>();
            channel.onmessage = (event) => {
                switch (event.type) {
                    case 'data':
                        if (event.data) {
                            callbacksRef.current.onData(new Uint8Array(event.data));
                        }
                        break;
                    case 'exited':
                        callbacksRef.current.onExit(event.exitCode ?? null);
                        break;
                    case 'error':
                        callbacksRef.current.onError(event.message ?? 'Unknown error');
                        break;
                }
            };
            channelRef.current = channel;
        }
        return channelRef.current;
    }, []);

    useEffect(() => {
        return () => {
            channelRef.current = null;
        };
    }, []);

    return { getChannel };
}
