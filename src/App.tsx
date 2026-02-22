import { useState, useCallback } from 'react'
import { Sidebar } from './components/Sidebar'
import { MainPanel } from './components/MainPanel'
import { ContextPanel } from './components/ContextPanel'
import type { ExecutionStatus } from './components/ContextPanel'
import type { LogEntry } from './components/StreamingConsole'
import { useExecutionSocket } from './hooks/useExecutionSocket'
import { startExecution, killExecution, getExecution } from './services/api'
import './index.css'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Execution state
  const [status, setStatus] = useState<ExecutionStatus>('idle')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [executionId, setExecutionId] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [duration, setDuration] = useState<string | null>(null)
  const [resultSummary, setResultSummary] = useState<string | null>(null)

  // Duration timer
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null)

  // WebSocket connection — subscribes when executionId is set
  useExecutionSocket({
    executionId,
    onLog: (msg) => {
      setLogs((prev) => [
        ...prev,
        {
          id: `${msg.timestamp}-${prev.length}`,
          timestamp: new Date(msg.timestamp).toLocaleTimeString(),
          type: msg.stream === 'stderr' ? 'error' : 'info',
          message: msg.data,
        },
      ])

      // Update duration
      if (startTimestamp) {
        const elapsed = Math.round((Date.now() - startTimestamp) / 1000)
        setDuration(`${elapsed}s`)
      }
    },
    onLogReplay: (msg) => {
      if (!msg.data) return
      // Parse replayed logs into entries
      const lines = msg.data.split('\n').filter(Boolean)
      const entries: LogEntry[] = lines.map((line, i) => {
        // Format: [timestamp] [stream] message
        const match = line.match(/^\[([^\]]+)\]\s+\[(\w+)\]\s+(.*)$/)
        if (match) {
          return {
            id: `replay-${i}`,
            timestamp: new Date(match[1]).toLocaleTimeString(),
            type: match[2] === 'stderr' ? 'error' as const : 'info' as const,
            message: match[3],
          }
        }
        return {
          id: `replay-${i}`,
          timestamp: '',
          type: 'info' as const,
          message: line,
        }
      })
      setLogs(entries)
    },
    onStatus: (msg) => {
      const newStatus = msg.status as ExecutionStatus
      setStatus(newStatus)

      if (newStatus === 'completed' || newStatus === 'failed') {
        // Update duration one final time
        if (startTimestamp) {
          const elapsed = Math.round((Date.now() - startTimestamp) / 1000)
          setDuration(`${elapsed}s`)
        }

        // Fetch final execution metadata
        if (executionId) {
          getExecution(executionId).then((exec) => {
            if (exec.exitCode !== undefined) {
              setResultSummary(
                newStatus === 'completed'
                  ? `Task completed successfully.\n\nExit code: ${exec.exitCode}\nExecution ID: ${exec.id}`
                  : `Task failed.\n\nExit code: ${exec.exitCode}\nError: ${exec.error || 'Process exited with non-zero code'}\nExecution ID: ${exec.id}`
              )
            }
          }).catch(() => {
            // Silently handle if metadata fetch fails
          })
        }

        // Add a final log entry
        setLogs((prev) => [
          ...prev,
          {
            id: `status-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: newStatus === 'completed' ? 'success' : 'error',
            message: newStatus === 'completed'
              ? '━━━ Execution complete. All tasks finished successfully. ━━━'
              : `━━━ Execution failed. Exit code: ${msg.exitCode ?? 'unknown'} ━━━`,
          },
        ])
      }
    },
  })

  const handleRun = useCallback(async (prompt: string, files: File[]) => {
    try {
      setLogs([])
      setResultSummary(null)
      setDuration(null)
      setStatus('running')

      const now = Date.now()
      setStartTimestamp(now)
      setStartTime(new Date(now).toLocaleTimeString())

      // Add initial log entry
      setLogs([{
        id: 'init',
        timestamp: new Date(now).toLocaleTimeString(),
        type: 'command',
        message: `> ${prompt}`,
      }])

      // Call the backend
      const result = await startExecution(prompt, files)
      setExecutionId(result.executionId) // This triggers WebSocket subscribe
      setStatus(result.status as ExecutionStatus)
    } catch (err: any) {
      setStatus('failed')
      setLogs((prev) => [
        ...prev,
        {
          id: 'error',
          timestamp: new Date().toLocaleTimeString(),
          type: 'error',
          message: `Error: ${err.message}`,
        },
      ])
    }
  }, [])

  const handleKill = useCallback(async () => {
    if (!executionId) return
    try {
      await killExecution(executionId)
      setLogs((prev) => [
        ...prev,
        {
          id: `kill-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'error',
          message: '━━━ Execution terminated by user. ━━━',
        },
      ])
    } catch (err: any) {
      // Process may have already finished
    }
  }, [executionId])

  return (
    <div className="flex h-screen w-screen bg-background text-zinc-300 font-sans overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <MainPanel
        isRunning={status === 'running'}
        logs={logs}
        onRun={handleRun}
        onKill={handleKill}
      />
      <ContextPanel
        status={status}
        executionId={executionId}
        startTime={startTime}
        duration={duration}
        resultSummary={resultSummary}
      />
    </div>
  )
}

export default App
