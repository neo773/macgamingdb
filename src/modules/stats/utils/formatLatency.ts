export function formatLatency(microseconds: number): string {
  if (microseconds >= 1_000_000) {
    return (microseconds / 1_000_000).toFixed(2) + 's';
  }
  if (microseconds >= 1_000) {
    return (microseconds / 1_000).toFixed(2) + 'ms';
  }
  return microseconds.toFixed(2) + 'μs';
}
