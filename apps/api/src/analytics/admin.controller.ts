import { Body, Controller, Get, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { AdminService } from './admin.service';

@Controller('admin') @UseGuards(AccessTokenGuard, RbacGuard) @RequirePermissions('admin:access')
export class AdminController {
  constructor(@Inject(AdminService) private readonly service: AdminService) {}
  @Get('dashboard') dashboard() { return this.service.dashboard(); }
  @Get('users') users() { return this.service.users(); }
  @Get('anchors') anchors() { return this.service.anchors(); }
  @Get('operations') operations() { return this.service.operations(); }
  @Get('commerce') commerce() { return this.service.commerce(); }
  @Get('config') config() { return this.service.config(); }
  @Get('audit') audit() { return this.service.audit(); }
  @Post('wallet/adjust') adjust(@Req() request: { user: { sub: string } }, @Body() body: { userId?: string; amount?: number; reason?: string }) { return this.service.adjustWallet(request.user.sub, body); }
  @Get('reports/users.csv') csv(@Res() response: Response) { response.type('text/csv').attachment('users.csv').send(`\uFEFF${this.service.usersCsv()}`); }
}
