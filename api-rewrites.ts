export const apiRewrites = () => {
  const apiServerUrl = process.env.INTERNAL_API_URL ?? 'http://localhost:4000';
  return [
    { source: '/api/trpc/:path*', destination: `${apiServerUrl}/trpc/:path*` },
    { source: '/api/rest/:path*', destination: `${apiServerUrl}/rest/:path*` },
    {
      source: '/discord/interactions',
      destination: `${apiServerUrl}/discord/interactions`,
    },
  ];
};
