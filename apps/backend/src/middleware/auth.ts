import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from './errorHandler.js';
import { Role } from '@certiflow/shared';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.query && typeof req.query.token === 'string') {
    // Support EventSource/SSE connections that pass token via query parameter
    token = req.query.token;
  } else {
    throw new UnauthorizedError('Authentication token missing or invalid');
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }
}

export function authorizeRoles(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`Access denied for role: ${req.user.role}`);
    }

    next();
  };
}

export function enforceDistrictScoping(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  // State Officers and Admins have statewide access
  if (req.user.role === 'STATE_OFFICER' || req.user.role === 'ADMIN') {
    return next();
  }

  // District Officers and Training Centres MUST have a districtId
  if (!req.user.districtId) {
    throw new ForbiddenError('User is not associated with any district');
  }

  next();
}
