import React from 'react';
import { PromptArea } from './PromptArea';
import { StreamingConsole } from './StreamingConsole';
import type { LogEntry } from './StreamingConsole';

export type ExecutionMode = 'standard' | 'onboarding';


interface MainPanelProps {
    isRunning: boolean;
    logs: LogEntry[];
    onRun: (prompt: string, files: File[]) => void;
    onKill?: () => void;
}

export const MainPanel: React.FC<MainPanelProps> = ({ isRunning, logs, onRun, onKill }) => {
    const [mode, setMode] = React.useState<ExecutionMode>('standard');

    return (
        <main className="flex-1 flex flex-col min-w-0 bg-background">
            <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
                <h1 className="text-lg font-medium text-zinc-100">Execution Workspace</h1>

                <div className="flex bg-[#0a0a0a] border border-border rounded-lg p-1">
                    <button
                        onClick={() => setMode('standard')}
                        disabled={isRunning}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'standard'
                                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Standard Execution
                    </button>
                    <button
                        onClick={() => setMode('onboarding')}
                        disabled={isRunning}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'onboarding'
                                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Company Onboarding
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <PromptArea onRun={onRun} onKill={onKill} isRunning={isRunning} mode={mode} />
                <StreamingConsole logs={logs} />
            </div>
        </main>
    );
};
