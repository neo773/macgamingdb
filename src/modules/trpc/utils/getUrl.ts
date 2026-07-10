export const getUrl = () => {
  if (typeof window !== 'undefined') {
    return '/api/trpc';
  }

  return `${process.env.INTERNAL_API_URL ?? 'http://localhost:4000'}/trpc`;
};
