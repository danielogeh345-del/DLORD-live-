import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { IAuthPayload } from '@auth/interfaces/auth.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: IAuthPayload = request.user;

    if (!user || !user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
