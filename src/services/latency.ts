/** Simulated latency so skeleton/loading states are visible in Phase 1. Removed once real I/O exists. */
let multiplier = 1;
export const setLatencyMultiplier = (m: number) => {
  multiplier = m;
};
export const getLatencyMultiplier = () => multiplier;
export const simulateLatency = (ms = 320) => new Promise<void>((resolve) => setTimeout(resolve, ms * multiplier));
