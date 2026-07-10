import { Injectable } from '@nestjs/common';
import {
  TRPCMiddleware,
  MiddlewareOptions,
  MiddlewareResponse,
} from 'nestjs-trpc';
import { mapCustomExceptionToTrpcError } from './map-custom-exception-to-trpc-error.util';

@Injectable()
export class ExceptionMappingMiddleware implements TRPCMiddleware {
  async use(opts: MiddlewareOptions): Promise<MiddlewareResponse> {
    const result = await opts.next();
    if (!result.ok) {
      mapCustomExceptionToTrpcError(result.error);
    }
    return result;
  }
}
