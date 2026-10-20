import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './config/environment';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './users/account.module';
import { ContentModule } from './content/content.module';
import { CommerceModule } from './catalog/commerce.module';
import { RealtimeModule } from './live/realtime.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validateEnvironment,
    }),
    AuthModule,
    AccountModule,
    ContentModule,
    CommerceModule,
    RealtimeModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
