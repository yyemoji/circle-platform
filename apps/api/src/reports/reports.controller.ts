import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/access-token.guard'; import { AccountService } from '../users/account.service';
@Controller('reports') @UseGuards(AccessTokenGuard)
export class ReportsController { constructor(@Inject(AccountService) private service: AccountService) {} @Post() create(@Req() req: { user: { sub: string } }, @Body() body: { targetType?: string; targetId?: string; reason?: string }) { return this.service.report(req.user.sub, body); } @Get(':id') get(@Req() req: { user: { sub: string } }, @Param('id') id: string) { return this.service.reportStatus(req.user.sub, id); } }
