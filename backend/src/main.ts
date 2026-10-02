import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    cors: false,
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = Number(process.env.PORT) || configService.get<number>('port', 4000);
  const frontendUrl = configService.get<string>('frontendUrl', 'http://localhost:3000');
  const nodeEnv = configService.get<string>('nodeEnv', 'development');

  // Security Middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );
  app.use(compression());

  // CORS Configuration supporting Vercel production, preview deployments, and local dev
  const allowedOrigins = [
    frontendUrl,
    'https://movie-matcher.rishankkesarwani.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., server-to-server, curl, health probes)
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.rishankkesarwani.com');

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable Graceful Shutdown
  app.enableShutdownHooks();

  // OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI Movie Matcher API')
    .setDescription(
      'Production-Grade AI-Powered Movie Discovery, Hybrid Recommendation Engine & Assistant API',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT Access Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication & token rotation')
    .addTag('Movies', 'Movie catalog, search, and TMDB discovery')
    .addTag('Recommendations', 'Hybrid AI scoring & personalized recommendations')
    .addTag('AI Platform', 'Conversational movie assistant & semantic search')
    .addTag('Watchlist', 'User watchlist operations')
    .addTag('Watched', 'Viewing history and reviews')
    .addTag('Preferences', 'Taste profiles and explicit/implicit preferences')
    .addTag('Notifications', 'Dual-channel email and push delivery via notification-service')
    .addTag('Health', 'Health probes and readiness checks')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port, '0.0.0.0');
  logger.log(`🎬 AI Movie Matcher Backend running on http://0.0.0.0:${port} [${nodeEnv}]`);
  logger.log(`📚 Swagger Docs available at http://0.0.0.0:${port}/api/docs`);
}

bootstrap();
