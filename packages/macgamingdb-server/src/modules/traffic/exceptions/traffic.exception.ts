import { CustomException } from '../../../engine/exceptions/custom.exception';

export type TrafficExceptionCode = 'TRAFFIC_SUBMIT_FAILED';

export class TrafficException extends CustomException<TrafficExceptionCode> {}
