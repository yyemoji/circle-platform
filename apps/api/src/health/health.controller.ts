import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface HealthResponse {
  status: 'ok';
  database: string;
  redis: string;
  storage: string;
}

@Controller('health')
export class HealthController {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  @Get()
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      database: this.config.get<string>('DATABASE_URL') ? 'configured' : 'not-configured',
      redis: this.config.get<string>('REDIS_URL') ? 'configured' : 'not-configured',
      storage: this.config.get<string>('STORAGE_DRIVER', 'local'),
    };
  }
}
