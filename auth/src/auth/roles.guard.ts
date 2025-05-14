import {
Injectable,
CanActivate,
ExecutionContext,
ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
constructor(private reflector: Reflector) {}


canActivate(context: ExecutionContext): boolean {
const roles = this.reflector.getAllAndOverride<string[]>('roles', [
context.getHandler(),
context.getClass(),
]);
if (!roles) return true;
const request = context.switchToHttp().getRequest();
const user = request.user;

if (!user || !roles.includes(user.role)) {
  throw new ForbiddenException('No tienes permiso para acceder');
}

return true;
}
}