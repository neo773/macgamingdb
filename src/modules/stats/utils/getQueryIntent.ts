export function getQueryIntent(query: string): string {
  const upperQuery = query.toUpperCase();
  if (upperQuery.includes('SELECT COUNT')) return 'COUNT';
  if (upperQuery.includes('SELECT') && upperQuery.includes('FROM')) {
    if (upperQuery.includes('JOIN')) return 'JOIN QUERY';
    if (upperQuery.includes('WHERE')) return 'FILTERED SELECT';
    return 'SELECT';
  }
  if (upperQuery.includes('INSERT')) return 'INSERT';
  if (upperQuery.includes('UPDATE')) return 'UPDATE';
  if (upperQuery.includes('DELETE')) return 'DELETE';
  return 'QUERY';
}
