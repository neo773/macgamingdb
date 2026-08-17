import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';
import { INTERNAL_REQUEST_SECRET_HEADER } from '../constants/internal-request-secret-header.constant';
import { isMatchingSecret } from '../utils/is-matching-secret.util';

@Injectable()
export class InternalRequestGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expectedSecret = process.env.INTERNAL_API_SECRET;

    if (!isNonEmptyString(expectedSecret)) {
      throw new UnauthorizedException('Internal API secret is not configured');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const providedSecret = request.header(INTERNAL_REQUEST_SECRET_HEADER);

    if (
      !isNonEmptyString(providedSecret) ||
      !isMatchingSecret({ provided: providedSecret, expected: expectedSecret })
    ) {
      throw new UnauthorizedException('Invalid internal API secret');
    }

    return true;
  }
}
