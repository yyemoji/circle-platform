import { Body, Controller, Get, Inject, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { AccountService } from './account.service';
interface AuthRequest { user: { sub: string } }
@Controller('users/me') @UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(@Inject(AccountService) private service: AccountService) {}
  @Get() get(@Req() req: AuthRequest) { return this.service.profile(req.user.sub); }
  @Patch() update(@Req() req: AuthRequest, @Body() body: { displayName?: string; avatarUrl?: string | null; bio?: string | null }) { return this.service.updateProfile(req.user.sub, body); }
  @Get('audit') audit(@Req() req: AuthRequest) { return this.service.audit(req.user.sub); }
  @Post('applications') apply(@Req() req: AuthRequest, @Body() body: { type: 'ACCOUNT_MERGE' | 'JOIN_US'; payload: unknown }) { return this.service.apply(req.user.sub, body.type, body.payload); }
  @Get('applications') applications(@Req() req: AuthRequest) { return this.service.applications(req.user.sub); }
}
