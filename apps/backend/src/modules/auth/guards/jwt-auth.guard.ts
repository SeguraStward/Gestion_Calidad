import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    if (process.env.JWT_DISABLED == 'true') {
      return true; // Permite el acceso sin validar JWT
    }
    return super.canActivate(context);
  }
}
