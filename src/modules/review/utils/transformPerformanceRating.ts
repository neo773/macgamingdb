export function transformPerformanceRating(rating: string): string {
  return rating
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
