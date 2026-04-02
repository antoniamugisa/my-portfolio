/**
 * Runs a callback at most once per `intervalMs` wall time (uses `performance.now()`).
 */
export function createThrottledSampler(options: { intervalMs: number }) {
  const { intervalMs } = options;
  let lastSampleTime = 0;

  return {
    sample: (callback: () => void) => {
      const now = performance.now();
      if (now - lastSampleTime >= intervalMs) {
        callback();
        lastSampleTime = now;
      }
    },
    reset: () => {
      lastSampleTime = 0;
    },
  };
}

export type ThrottledSampler = ReturnType<typeof createThrottledSampler>;
