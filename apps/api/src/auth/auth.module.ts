import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { AccessTokenGuard } from './access-token.guard';
import { AuthController } from './auth.controller';
import { AuthService, AuthSecrets } from './auth.service';
import { AuthStore } from './auth.store';
import { AUTH_SECRETS } from './auth.tokens';
import { PrismaAuthStore } from './prisma-auth.store';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    PrismaAuthStore,
    { provide: AuthStore, useExisting: PrismaAuthStore },
    { provide: AUTH_SECRETS, inject: [ConfigService], useFactory: (config: ConfigService): AuthSecrets => ({ accessSecret: config.get('JWT_ACCESS_SECRET', 'development-access-secret-change-before-production'), refreshSecret: config.get('JWT_REFRESH_SECRET', 'development-refresh-secret-change-before-production') }) },
    { provide: AuthService, inject: [AuthStore, JwtService, AUTH_SECRETS], useFactory: (store: AuthStore, jwt: JwtService, secrets: AuthSecrets) => new AuthService(store, jwt, secrets) },
    AccessTokenGuard,
  ],
  exports: [AuthService, AccessTokenGuard],
})
export class AuthModule {}
