export const FLOW_ERROR = {
  StateMismatch: 'state_mismatch',
  VerifyFailed: 'verify_failed',
  PrivateLibrary: 'private_library',
} as const;

export type FlowError = (typeof FLOW_ERROR)[keyof typeof FLOW_ERROR];
