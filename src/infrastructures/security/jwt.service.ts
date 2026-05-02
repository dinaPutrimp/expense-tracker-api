import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

@Injectable()
export class JwtTokenService {
  private readonly secret: string;

  constructor() {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
    this.secret = process.env.JWT_SECRET;
  }

  generateAccessToken(userId: string) {
    return jwt.sign({ sub: userId }, this.secret, {
      expiresIn: '30m',
    });
  }

  generateRefreshToken() {
    return nanoid(32);
  }

  verifyAccessToken(token: string): { sub: string } {
    try {
      return jwt.verify(token, this.secret) as { sub: string };
    } catch {
      throw new UnauthorizedException();
    }
  }
}
