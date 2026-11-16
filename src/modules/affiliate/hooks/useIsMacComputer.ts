import { useSyncExternalStore } from 'react';

const MAC_USER_AGENT_PATTERN = /Macintosh/;

const subscribe = () => () => {};

const getSnapshot = () =>
  MAC_USER_AGENT_PATTERN.test(navigator.userAgent) &&
  navigator.maxTouchPoints <= 1;

const getServerSnapshot = () => true;

export const useIsMacComputer = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
