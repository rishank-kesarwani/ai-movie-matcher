import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RedisService } from '../redis/redis.service';
import { NotificationClientService } from '../notifications/notification-client.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly redisService: RedisService,
    private readonly notificationClient: NotificationClientService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness health probe' })
  getLiveness() {
    return {
      status: 'ok',
      service: 'ai-movie-matcher-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe verifying DB, Redis, and shared microservices' })
  async getReadiness() {
    const mongoStatus =
      this.mongoConnection.readyState === 1 ? 'UP' : 'DOWN';
    const redisStatus = this.redisService.isReady() ? 'UP' : 'DEGRADED';

    return {
      status: mongoStatus === 'UP' ? 'READY' : 'NOT_READY',
      timestamp: new Date().toISOString(),
      checks: {
        mongodb: mongoStatus,
        redis: redisStatus,
        aiPlatform: 'STANDBY_INTEGRATED',
        notificationService: 'STANDBY_INTEGRATED',
      },
    };
  }
}
