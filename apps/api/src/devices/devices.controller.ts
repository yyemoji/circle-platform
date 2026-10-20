import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/access-token.guard'; import { AccountService } from '../users/account.service';
@Controller('devices') @UseGuards(AccessTokenGuard)
export class DevicesController { constructor(@Inject(AccountService) private service: AccountService) {} @Post() create(@Req() req: { user: { sub: string } }, @Body() body: { fingerprint?: string; name?: string }) { return this.service.bindDevice(req.user.sub, body); } }
