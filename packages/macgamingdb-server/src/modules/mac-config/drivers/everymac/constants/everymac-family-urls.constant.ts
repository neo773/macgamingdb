import { type MacFamily } from '../../../../../schema';

// TODO: Add MacBookNeo once its 2nd generation ships; the index page currently
// redirects to the 1st generation, so it is populated from a static constant.
export const EVERYMAC_FAMILY_URLS: Partial<Record<MacFamily, string>> = {
  MacBookPro:
    'https://everymac.com/systems/apple/macbook_pro/all-apple-silicon-macbook-pro-models.html',
  iMac: 'https://everymac.com/systems/apple/imac/all-apple-silicon-imac-models.html',
  MacMini:
    'https://everymac.com/systems/apple/mac_mini/all-apple-silicon-mac-mini-models.html',
  MacPro:
    'https://everymac.com/systems/apple/mac_pro/all-apple-silicon-mac-pro-models.html',
  MacStudio: 'https://everymac.com/systems/apple/mac-studio/index-macstudio.html',
  MacBookAir:
    'https://everymac.com/systems/apple/macbook-air/all-apple-silicon-macbook-air-models.html',
};
