const API_BASE = 'http://localhost:3001';

/**
 * POST /api/execute — Start a new execution.
 * Sends prompt + optional images as multipart/form-data.
 */
export async function startExecution(
    prompt: string,
    imageFiles: File[]
): Promise<{ executionId: string; status: string; message: string }> {
    const formData = new FormData();
    formData.append('prompt', prompt);
    imageFiles.forEach((file) => formData.append('images', file));

    const res = await fetch(`${API_BASE}/api/execute`, {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type — browser sets it with boundary
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || `Request failed: ${res.status}`);
    }

    return res.json();
}

/**
 * GET /api/executions/:id — Get execution metadata.
 */
export async function getExecution(id: string) {
    const res = await fetch(`${API_BASE}/api/executions/${id}`);
    if (!res.ok) throw new Error(`Execution not found: ${id}`);
    return res.json();
}

/**
 * GET /api/executions — List all executions.
 */
export async function listExecutions() {
    const res = await fetch(`${API_BASE}/api/executions`);
    if (!res.ok) throw new Error('Failed to fetch executions');
    return res.json();
}

/**
 * GET /api/executions/:id/logs — Get historical log contents.
 */
export async function getExecutionLogs(id: string): Promise<{ executionId: string; logs: string }> {
    const res = await fetch(`${API_BASE}/api/executions/${id}/logs`);
    if (!res.ok) throw new Error(`Logs not found: ${id}`);
    return res.json();
}

/**
 * POST /api/executions/:id/kill — Kill a running execution.
 */
export async function killExecution(id: string) {
    const res = await fetch(`${API_BASE}/api/executions/${id}/kill`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to kill: ${id}`);
    return res.json();
}

/**
 * GET /health — Health check.
 */
export async function healthCheck() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
}
