import { Controller, Get, Head, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Root')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'API service root status and documentation links' })
  getRoot() {
    return {
      service: 'AI Movie Matcher API',
      version: '1.0.0',
      status: 'online',
      documentation: '/api/docs',
      health: '/health',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Head()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Root HEAD check for load balancer health probes' })
  headRoot() {
    return;
  }
}
