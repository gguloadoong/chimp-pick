import { Injectable } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import type { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user: User;
}

/**
 * JWT auth guard — wraps Passport JWT strategy.
 * Use @UseGuards(AuthGuard) on routes that require authentication.
 */
@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {}
