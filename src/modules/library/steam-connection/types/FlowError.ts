import { FLOW_ERROR } from '@/modules/library/steam-connection/constants/FLOW_ERROR';

export type FlowError = (typeof FLOW_ERROR)[keyof typeof FLOW_ERROR];
