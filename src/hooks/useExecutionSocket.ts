import { useEffect, useRef, useCallback, useState } from 'react';

const WS_URL = 'ws://localhost:3001/ws';

export type WsLogMessage = {
    type: 'log';
    executionId: string;
    stream: 'stdout' | 'stderr';
    data: string;
    timestamp: string;
};

export type WsStatusMessage = {
    type: 'status';
    executionId: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    exitCode?: number;
    signal?: string | null;
    timestamp: string;
};

export type WsLogReplayMessage = {
    type: 'log-replay';
    executionId: string;
    data: string;
    timestamp: string;
};

export type WsMessage = WsLogMessage | WsStatusMessage | WsLogReplayMessage;

interface UseExecutionSocketOptions {
    executionId: string | null;
    onLog: (msg: WsLogMessage) => void;
    onLogReplay: (msg: WsLogReplayMessage) => void;
    onStatus: (msg: WsStatusMessage) => void;
}

export function useExecutionSocket({
    executionId,
    onLog,
    onLogReplay,
    onStatus,
}: UseExecutionSocketOptions) {
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);

    // Use refs for callbacks to avoid reconnecting on every render
    const onLogRef = useRef(onLog);
    const onLogReplayRef = useRef(onLogReplay);
    const onStatusRef = useRef(onStatus);
    onLogRef.current = onLog;
    onLogReplayRef.current = onLogReplay;
    onStatusRef.current = onStatus;

    useEffect(() => {
        if (!executionId) return;

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            // Subscribe to this execution
            ws.send(JSON.stringify({ type: 'subscribe', executionId }));
        };

        ws.onmessage = (event) => {
            try {
                const msg: WsMessage = JSON.parse(event.data);

                switch (msg.type) {
                    case 'log':
                        onLogRef.current(msg as WsLogMessage);
                        break;
                    case 'log-replay':
                        onLogReplayRef.current(msg as WsLogReplayMessage);
                        break;
                    case 'status':
                        onStatusRef.current(msg as WsStatusMessage);
                        break;
                }
            } catch {
                // Ignore non-JSON messages (pings, etc.)
            }
        };

        ws.onclose = () => {
            setConnected(false);
        };

        ws.onerror = () => {
            setConnected(false);
        };

        return () => {
            // Unsubscribe before closing
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'unsubscribe' }));
            }
            ws.close();
            wsRef.current = null;
        };
    }, [executionId]);

    const disconnect = useCallback(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'unsubscribe' }));
            wsRef.current.close();
        }
    }, []);

    return { connected, disconnect };
}
