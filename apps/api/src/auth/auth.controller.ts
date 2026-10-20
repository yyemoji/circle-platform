import { Body, Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { AccessTokenGuard } from './access-token.guard';
import { AuthService } from './auth.service';

class LoginDto { @IsString() @IsNotEmpty() username!: string; @IsString() @MinLength(6) password!: string; }
class RefreshDto { @IsString() @IsNotEmpty() refreshToken!: string; }

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}
  @Post('login') login(@Body() input: LoginDto) { return this.auth.login(input.username, input.password); }
  @Post('refresh') refresh(@Body() input: RefreshDto) { return this.auth.refresh(input.refreshToken); }
  @Post('logout') async logout(@Body() input: RefreshDto) { await this.auth.logout(input.refreshToken); return { success: true }; }
  @Get('me') @UseGuards(AccessTokenGuard) me(@Req() request: { user: unknown }) { return request.user; }
}
