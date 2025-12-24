import { UAParser } from 'ua-parser-js';

export const isSVGFaviconSupported = (userAgent?: string): boolean => {
  if (!userAgent) return true;

  const parser = UAParser(userAgent);
  const { name: browserName, major: browserVersion } = parser.browser;
  const deviceType = parser.device.type;

  const version = browserVersion ? parseInt(browserVersion, 10) : NaN;
  const isMobile = deviceType === 'mobile' || deviceType === 'tablet';

  if (browserName === 'Chrome' && isMobile && version < 137) {
    return false;
  }

  if (
    (browserName === 'Safari' || browserName === 'Mobile Safari') &&
    version < 26
  ) {
    return false;
  }

  return true;
};
