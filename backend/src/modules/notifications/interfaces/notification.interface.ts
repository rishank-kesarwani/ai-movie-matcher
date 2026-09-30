export type NotificationChannel = 'EMAIL' | 'PUSH';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface NotificationRecipient {
  userId: string;
  email?: string;
  phone?: string;
  pushToken?: string;
  name?: string;
}

export interface IngestNotificationPayload {
  applicationId: string;
  templateId?: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  recipient: NotificationRecipient;
  idempotencyKey: string;
  subject?: string;
  body?: string;
  data?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  notificationId?: string;
  idempotencyStatus?: 'CREATED' | 'PROCESSED' | 'SKIPPED';
  enqueuedChannels?: Array<{
    channel: NotificationChannel;
    queue: string;
    jobId: string;
  }>;
}

export interface SyncNotificationPreferencesDto {
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  weeklyDigest?: boolean;
  movieReleases?: boolean;
  recommendations?: boolean;
}
