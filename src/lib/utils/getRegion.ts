/**
 * Extracts a two-letter country code from request headers.
 *
 * Checks provider-specific geo headers (Cloudflare, Vercel, AWS CloudFront,
 * Fastly, Netlify, Akamai) then falls back to parsing Accept-Language.
 * Returns lowercase ISO 3166-1 alpha-2 code, defaulting to 'us'.
 */
export function getRegion(headerStore: Headers): string {
  const geoHeaders = [
    'cf-ipcountry',            // Cloudflare
    'x-vercel-ip-country',     // Vercel
    'cloudfront-viewer-country', // AWS CloudFront
    'x-country-code',          // Fastly
    'x-country',               // Netlify
    'x-akamai-edgescape',      // Akamai (needs parsing, handled below)
  ];

  for (const header of geoHeaders) {
    const value = headerStore.get(header);
    if (!value || value === 'XX') continue;

    // Akamai packs geo data as key=value pairs: "country_code=US,region_code=CA,..."
    if (header === 'x-akamai-edgescape') {
      const match = value.match(/country_code=([A-Z]{2})/i);
      if (match) return match[1].toLowerCase();
      continue;
    }

    if (/^[A-Z]{2}$/i.test(value)) return value.toLowerCase();
  }

  // Fallback: derive from Accept-Language (e.g. "en-US,en;q=0.9" → "us")
  const acceptLang = headerStore.get('accept-language');
  if (acceptLang) {
    const regionMatch = acceptLang.match(/[a-z]{2}-([A-Z]{2})/);
    if (regionMatch) return regionMatch[1].toLowerCase();
  }

  return 'us';
}
