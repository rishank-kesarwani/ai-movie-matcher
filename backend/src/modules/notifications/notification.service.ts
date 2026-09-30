import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationClientService } from './notification-client.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly applicationId: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly client: NotificationClientService,
    private readonly configService: ConfigService,
  ) {
    this.applicationId = this.configService.get<string>(
      'applicationId',
      'ai-movie-matcher',
    );
    this.frontendUrl = this.configService.get<string>(
      'frontendUrl',
      'http://localhost:3000',
    );
  }

  async sendWelcomeNotification(user: {
    id: string;
    email: string;
    name?: string;
  }): Promise<void> {
    const name = user.name || 'Cinephile';
    const timestamp = Date.now();

    await this.client.sendNotification({
      applicationId: this.applicationId,
      priority: 'CRITICAL',
      channels: ['EMAIL', 'PUSH'],
      recipient: {
        userId: user.id,
        email: user.email,
        name,
      },
      idempotencyKey: `welcome_${user.id}_${timestamp}`,
      subject: `Welcome to AI Movie Matcher, ${name}! 🎬`,
      body: `Hi ${name},\n\nWelcome to AI Movie Matcher! Your personalized AI film curator is ready to discover incredible movies tailored specifically to your taste.\n\nExplore trending films, ask our AI assistant for tailored suggestions, and build your smart watchlist!\n\nStart exploring: ${this.frontendUrl}`,
      data: {
        type: 'WELCOME',
        userId: user.id,
        ctaUrl: `${this.frontendUrl}/recommendations`,
      },
      metadata: {
        source: 'auth_registration',
      },
    });
  }

  async sendPasswordResetNotification(
    user: { id: string; email: string; name?: string },
    resetToken: string,
  ): Promise<void> {
    const name = user.name || 'Movie Fan';
    const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`;
    const timestamp = Date.now();

    await this.client.sendNotification({
      applicationId: this.applicationId,
      priority: 'CRITICAL',
      channels: ['EMAIL'],
      recipient: {
        userId: user.id,
        email: user.email,
        name,
      },
      idempotencyKey: `pwd_reset_${user.id}_${timestamp}`,
      subject: 'Reset Your AI Movie Matcher Password 🔐',
      body: `Hi ${name},\n\nWe received a request to reset your AI Movie Matcher account password.\n\nPlease click the link below to set a new password. This link is valid for 1 hour:\n\n${resetUrl}\n\nIf you did not make this request, you can safely ignore this email.`,
      data: {
        type: 'PASSWORD_RESET',
        resetUrl,
        expiresIn: '1 hour',
      },
      metadata: {
        source: 'auth_forgot_password',
      },
    });
  }

  async sendPersonalizedRecommendationNotification(
    user: { id: string; email: string; name?: string },
    movies: Array<{ id: number | string; title: string; matchScore?: number; reason?: string }>,
  ): Promise<void> {
    const name = user.name || 'Movie Lover';
    const timestamp = Date.now();
    const movieTitles = movies.slice(0, 3).map((m) => `• ${m.title}`).join('\n');

    await this.client.sendNotification({
      applicationId: this.applicationId,
      priority: 'MEDIUM',
      channels: ['EMAIL', 'PUSH'],
      recipient: {
        userId: user.id,
        email: user.email,
        name,
      },
      idempotencyKey: `recommendations_${user.id}_${new Date().toISOString().split('T')[0]}`,
      subject: `New AI Recommendations Curated For You 🍿`,
      body: `Hi ${name},\n\nOur AI engine just matched fresh movies based on your recent viewing habits and ratings:\n\n${movieTitles}\n\nCheck out why each was picked for you on your personalized recommendations dashboard:\n${this.frontendUrl}/recommendations`,
      data: {
        type: 'PERSONALIZED_RECOMMENDATIONS',
        movies: movies.slice(0, 5),
        ctaUrl: `${this.frontendUrl}/recommendations`,
      },
    });
  }

  async sendWatchlistReleaseNotification(
    user: { id: string; email: string; name?: string },
    movie: { id: number | string; title: string; releaseDate?: string; posterPath?: string },
  ): Promise<void> {
    const name = user.name || 'Friend';
    const timestamp = Date.now();

    await this.client.sendNotification({
      applicationId: this.applicationId,
      priority: 'HIGH',
      channels: ['EMAIL', 'PUSH'],
      recipient: {
        userId: user.id,
        email: user.email,
        name,
      },
      idempotencyKey: `watchlist_rel_${user.id}_${movie.id}_${timestamp}`,
      subject: `🎬 "${movie.title}" is now released!`,
      body: `Hi ${name},\n\nA movie from your watchlist, "${movie.title}", has officially arrived! Check out full streaming availability and user reviews now.\n\nView details: ${this.frontendUrl}/movies/${movie.id}`,
      data: {
        type: 'WATCHLIST_RELEASE',
        movieId: movie.id,
        movieTitle: movie.title,
        ctaUrl: `${this.frontendUrl}/movies/${movie.id}`,
      },
    });
  }
}
