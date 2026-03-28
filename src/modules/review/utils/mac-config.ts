export const getDeviceIcon = (family: string) => {
  return `/images/devices/${family}.svg`;
};

export const getHumanReadableFamily = (family: string) => {
  switch (family) {
    case 'MacBookPro':
      return 'MacBook Pro';
    case 'MacBookAir':
      return 'MacBook Air';
    case 'MacBookNeo':
      return 'MacBook Neo';
    case 'MacBook':
      return 'MacBook';
    case 'iMac':
      return 'iMac';
    case 'MacMini':
      return 'Mac mini';
    case 'MacPro':
      return 'Mac Pro';
    case 'MacStudio':
      return 'Mac Studio';
    default:
      return family;
  }
};
