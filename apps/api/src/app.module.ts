import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './config/environment';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './users/account.module';
import { ContentModule } from './content/content.module';

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
  ],
  controllers: [HealthController],
})
export class AppModule {}
