import React from 'react';
import { CheckCircle2, XCircle, Loader2, Circle, Clock, Hash, Timer, ChevronDown, ChevronUp } from 'lucide-react';

export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'failed';

interface ContextPanelProps {
    status: ExecutionStatus;
    executionId: string | null;
    startTime: string | null;
    duration: string | null;
    resultSummary: string | null;
}

const statusConfig: Record<ExecutionStatus, { label: string; color: string; dotColor: string; icon: React.ReactNode }> = {
    idle: {
        label: 'Idle',
        color: 'text-zinc-400',
        dotColor: 'bg-zinc-500',
        icon: <Circle className="h-4 w-4 text-zinc-500" />,
    },
    running: {
        label: 'Running',
        color: 'text-blue-400',
        dotColor: 'bg-blue-500',
        icon: <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />,
    },
    completed: {
        label: 'Completed',
        color: 'text-emerald-400',
        dotColor: 'bg-emerald-500',
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    },
    failed: {
        label: 'Failed',
        color: 'text-red-400',
        dotColor: 'bg-red-500',
        icon: <XCircle className="h-4 w-4 text-red-400" />,
    },
};

export const ContextPanel: React.FC<ContextPanelProps> = ({
    status,
    executionId,
    startTime,
    duration,
    resultSummary,
}) => {
    const [resultExpanded, setResultExpanded] = React.useState(false);
    const cfg = statusConfig[status];

    return (
        <aside className="w-80 border-l border-border bg-panel flex flex-col shrink-0">
            <header className="h-14 border-b border-border flex items-center px-5">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Context</h2>
            </header>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Status Card */}
                <section className="rounded-lg border border-border bg-[#0f0f0f] p-4">
                    <h3 className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Execution Status</h3>
                    <div className="flex items-center gap-3">
                        {cfg.icon}
                        <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                        {status === 'running' && (
                            <span className="relative flex h-2 w-2 ml-auto">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                        )}
                    </div>
                </section>

                {/* Metadata */}
                <section>
                    <h3 className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Metadata</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Hash className="h-3.5 w-3.5 text-zinc-600" />
                            <span className="text-zinc-500">Execution ID</span>
                            <span className="ml-auto text-zinc-300 font-mono text-xs truncate max-w-[120px]">
                                {executionId || '--'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3.5 w-3.5 text-zinc-600" />
                            <span className="text-zinc-500">Start Time</span>
                            <span className="ml-auto text-zinc-300 text-xs">{startTime || '--'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Timer className="h-3.5 w-3.5 text-zinc-600" />
                            <span className="text-zinc-500">Duration</span>
                            <span className="ml-auto text-zinc-300 text-xs">{duration || '--'}</span>
                        </div>
                    </div>
                </section>

                {/* Output Summary / Result Viewer */}
                <section>
                    <h3 className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Output Summary</h3>
                    {resultSummary ? (
                        <div
                            className={`rounded-lg border transition-all duration-300 overflow-hidden ${status === 'completed'
                                    ? 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                                    : status === 'failed'
                                        ? 'border-red-500/30 bg-red-500/5'
                                        : 'border-border bg-[#0f0f0f]'
                                }`}
                        >
                            <button
                                className="w-full flex items-center justify-between p-3 text-sm text-zinc-300 hover:text-zinc-100 transition-colors"
                                onClick={() => setResultExpanded(!resultExpanded)}
                            >
                                <span className="font-medium text-xs">View Result</span>
                                {resultExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-zinc-500" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                                )}
                            </button>
                            {resultExpanded && (
                                <div className="px-3 pb-3 text-xs text-zinc-400 font-mono leading-relaxed border-t border-border/50 pt-3">
                                    {resultSummary}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-24 rounded-lg border border-dashed border-border flex items-center justify-center text-xs text-zinc-600">
                            No output yet
                        </div>
                    )}
                </section>
            </div>
        </aside>
    );
};
