import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger('JwtAuthGuard');
  canActivate(context: ExecutionContext) {
    if (process.env.DISABLED_AUTH == 'true') {
      this.logger.warn('This guard is disabled, all requests will be allowed (DISABLED_AUTH=true)');
      return true;
    }
    return super.canActivate(context);
  }
}
