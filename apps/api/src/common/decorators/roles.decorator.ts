// Roles Decorator - Mark routes with required roles

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@school/database';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
