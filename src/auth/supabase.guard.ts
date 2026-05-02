import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthorizationError } from "src/commons/exceptions/authorization.error";
import * as jwt from 'jsonwebtoken'

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new AuthorizationError();

    const token = authHeader.replace('Bearer ', '');

    const decoded = jwt.verify(
      token,
      process.env.SUPABASE_JWT_SECRET!
    ) as any;

    request.user = { id: decoded.sub };
    return true;
  }
}
