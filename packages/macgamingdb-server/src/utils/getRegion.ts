const DEFAULT_REGION = 'us';

const COUNTRY_HEADERS = [
  'cf-ipcountry',
  'x-vercel-ip-country',
  'cloudfront-viewer-country',
  'x-country-code',
  'x-country',
] as const;

const ISO_ALPHA2 = /^[A-Z]{2}$/i;
const AKAMAI_COUNTRY = /country_code=([A-Z]{2})/i;
const ACCEPT_LANGUAGE_REGION = /[a-z]{2}-([A-Z]{2})/;

export function getRegion(headers: Headers): string {
  for (const header of COUNTRY_HEADERS) {
    const value = headers.get(header);
    if (value && value !== 'XX' && ISO_ALPHA2.test(value)) {
      return value.toLowerCase();
    }
  }

  const akamai = headers.get('x-akamai-edgescape')?.match(AKAMAI_COUNTRY);
  if (akamai) return akamai[1].toLowerCase();

  const acceptLang = headers.get('accept-language')?.match(ACCEPT_LANGUAGE_REGION);
  if (acceptLang) return acceptLang[1].toLowerCase();

  return DEFAULT_REGION;
}
