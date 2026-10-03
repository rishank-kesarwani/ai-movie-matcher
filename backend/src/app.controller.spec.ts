import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return service metadata and status online', () => {
      const result = appController.getRoot();
      expect(result.service).toBe('AI Movie Matcher API');
      expect(result.status).toBe('online');
      expect(result.documentation).toBe('/api/docs');
      expect(result.health).toBe('/health');
    });

    it('should handle headRoot without error', () => {
      expect(() => appController.headRoot()).not.toThrow();
    });
  });
});
