// src/common/middleware/request-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { randomUUID } from 'crypto';
// creating a middleware named RequestIdMiddleware
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] || randomUUID();
    req['id'] = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
  }
}
