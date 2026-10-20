import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/access-token.guard'; import { RbacGuard } from '../rbac/rbac.guard'; import { RequirePermissions } from '../rbac/require-permissions.decorator'; import { AccountService } from '../users/account.service';
@Controller('audit') @UseGuards(AccessTokenGuard, RbacGuard)
export class AuditController { constructor(@Inject(AccountService) private service: AccountService) {} @Get() @RequirePermissions('audit:read') list() { return this.service.allAudit(); } }
