import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

export interface LogEntry {
    id: string;
    timestamp: string;
    type: 'info' | 'error' | 'success' | 'command';
    message: string;
}

interface StreamingConsoleProps {
    logs: LogEntry[];
}

export const StreamingConsole: React.FC<StreamingConsoleProps> = ({ logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const [copied, setCopied] = useState(false);

    // Auto-scroll logic
    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
            setAutoScroll(isAtBottom);
        }
    };

    const handleCopy = () => {
        const text = logs.map(l => l.message).join('\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex-1 rounded-xl border border-border bg-[#0a0a0a] overflow-hidden flex flex-col shadow-inner">
            <div className="h-10 border-b border-border bg-panel flex items-center justify-between px-4">
                <div className="flex items-center gap-2 text-zinc-400">
                    <Terminal className="h-4 w-4" />
                    <span className="font-mono text-xs font-medium tracking-wide">Output Console</span>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer hover:text-zinc-300">
                        <input
                            type="checkbox"
                            className="rounded bg-zinc-800 border-zinc-700 text-primary focus:ring-primary focus:ring-offset-0"
                            checked={autoScroll}
                            onChange={(e) => setAutoScroll(e.target.checked)}
                        />
                        Auto-scroll
                    </label>
                    <div className="w-px h-4 bg-border" />
                    <button
                        onClick={handleCopy}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded hover:bg-zinc-800"
                        title="Copy Logs"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 p-4 font-mono text-xs md:text-sm overflow-y-auto space-y-1.5"
            >
                {logs.length === 0 ? (
                    <div className="text-zinc-600 italic">Waiting for execution to start...</div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="flex gap-3 font-mono leading-relaxed break-words">
                            <span className="text-zinc-600 shrink-0 select-none">[{log.timestamp}]</span>
                            <span className={`
                ${log.type === 'info' ? 'text-zinc-300' : ''}
                ${log.type === 'error' ? 'text-red-400 font-medium' : ''}
                ${log.type === 'success' ? 'text-emerald-400' : ''}
                ${log.type === 'command' ? 'text-primary brightness-125' : ''}
              `}>
                                {log.message}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
