export const deriveDisplayNameFromEmail = (email: string): string =>
  email.split('@')[0].replace(/[0-9._]/g, '');
