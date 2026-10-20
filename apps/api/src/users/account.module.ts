import { Module } from '@nestjs/common';
import { AuditController } from '../audit/audit.controller'; import { AuthModule } from '../auth/auth.module'; import { DatabaseModule } from '../database/database.module'; import { DevicesController } from '../devices/devices.controller'; import { ReportsController } from '../reports/reports.controller'; import { RbacGuard } from '../rbac/rbac.guard';
import { AccountService } from './account.service'; import { AccountStore } from './account.store'; import { PrismaAccountStore } from './prisma-account.store'; import { UsersController } from './users.controller';
@Module({ imports: [DatabaseModule, AuthModule], controllers: [UsersController, DevicesController, ReportsController, AuditController], providers: [AccountService, RbacGuard, PrismaAccountStore, { provide: AccountStore, useExisting: PrismaAccountStore }], exports: [AccountService] })
export class AccountModule {}
