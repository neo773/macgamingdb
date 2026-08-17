import { type ModerationAlertParams } from '../../src/modules/report/drivers/discord/types/moderation-alert-params.type';
import { type ModerationFailureAlertParams } from '../../src/modules/report/drivers/discord/types/moderation-failure-alert-params.type';

export type FakeDiscordMessageService = {
  alerts: ModerationAlertParams[];
  failureAlerts: ModerationFailureAlertParams[];
  setFailure: (error: Error | null) => void;
  postModerationAlert: (params: ModerationAlertParams) => Promise<void>;
  postModerationFailureAlert: (
    params: ModerationFailureAlertParams,
  ) => Promise<void>;
};

export const createFakeDiscordMessageService =
  (): FakeDiscordMessageService => {
    const alerts: ModerationAlertParams[] = [];
    const failureAlerts: ModerationFailureAlertParams[] = [];
    let failure: Error | null = null;

    return {
      alerts,
      failureAlerts,
      setFailure: (error: Error | null) => {
        failure = error;
      },
      postModerationAlert: async (params: ModerationAlertParams) => {
        if (failure) {
          throw failure;
        }

        alerts.push(params);
      },
      postModerationFailureAlert: async (
        params: ModerationFailureAlertParams,
      ) => {
        failureAlerts.push(params);
      },
    };
  };
