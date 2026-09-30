import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  IngestNotificationPayload,
  NotificationResponse,
  SyncNotificationPreferencesDto,
} from './interfaces/notification.interface';

@Injectable()
export class NotificationClientService {
  private readonly logger = new Logger(NotificationClientService.name);
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly applicationId: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      'notificationService.url',
      'http://localhost:3001',
    );
    this.apiKey = this.configService.get<string>(
      'notificationService.apiKey',
      'notification_service_api_key_12345',
    );
    this.applicationId = this.configService.get<string>(
      'applicationId',
      'ai-movie-matcher',
    );

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    });
  }

  async sendNotification(
    payload: IngestNotificationPayload,
  ): Promise<NotificationResponse | null> {
    try {
      this.logger.log(
        `[Notification Service] Dispatching ${payload.channels.join(',')} notification to user ${payload.recipient.userId} (Key: ${payload.idempotencyKey})`,
      );

      const response = await this.client.post<NotificationResponse>(
        '/v1/notifications',
        payload,
      );

      this.logger.log(
        `[Notification Service] Success! Notification ID: ${response.data.notificationId} enqueued across: ${response.data.enqueuedChannels?.map((c) => c.queue).join(', ')}`,
      );
      return response.data;
    } catch (err: any) {
      this.logger.warn(
        `[Notification Service] Warning: Notification dispatch to ${this.baseUrl}/v1/notifications failed (${err.message}). Notification handled gracefully without disrupting domain flow.`,
      );
      return null;
    }
  }

  async syncUserPreferences(
    userId: string,
    prefs: SyncNotificationPreferencesDto,
  ): Promise<boolean> {
    try {
      await this.client.put(`/v1/preferences/${userId}`, {
        applicationId: this.applicationId,
        preferences: prefs,
      });
      return true;
    } catch (err: any) {
      this.logger.warn(
        `[Notification Service] Failed to sync preferences for user ${userId}: ${err.message}`,
      );
      return false;
    }
  }

  async getMetrics(): Promise<any> {
    try {
      const response = await this.client.get('/metrics');
      return response.data;
    } catch (err: any) {
      this.logger.warn(
        `[Notification Service] Metrics unreachable (${err.message}). Returning fallback.`,
      );
      return {
        status: 'STANDBY',
        error: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
