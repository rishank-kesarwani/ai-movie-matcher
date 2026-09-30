import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationClientService } from './notification-client.service';
import { ConfigService } from '@nestjs/config';

describe('NotificationService', () => {
  let service: NotificationService;
  let clientMock: Partial<NotificationClientService>;

  beforeEach(async () => {
    clientMock = {
      sendNotification: jest.fn().mockResolvedValue({
        success: true,
        message: 'Notification enqueued successfully',
        notificationId: 'notif_12345',
        enqueuedChannels: [
          { channel: 'EMAIL', queue: 'email_critical', jobId: 'job_1' },
        ],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: NotificationClientService, useValue: clientMock },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultVal: any) => defaultVal),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should dispatch welcome dual-channel notification', async () => {
    await service.sendWelcomeNotification({
      id: 'usr_123',
      email: 'alex@example.com',
      name: 'Alex',
    });

    expect(clientMock.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: 'CRITICAL',
        channels: ['EMAIL', 'PUSH'],
        recipient: expect.objectContaining({
          userId: 'usr_123',
          email: 'alex@example.com',
        }),
      }),
    );
  });

  it('should dispatch password reset notification with token URL', async () => {
    await service.sendPasswordResetNotification(
      { id: 'usr_123', email: 'alex@example.com', name: 'Alex' },
      'secret_token_123',
    );

    expect(clientMock.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: 'CRITICAL',
        channels: ['EMAIL'],
        body: expect.stringContaining('secret_token_123'),
      }),
    );
  });
});
