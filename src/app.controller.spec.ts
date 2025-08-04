import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('should call AppService.getHello', () => {
      const spy = jest.spyOn(appService, 'getHello');
      appController.getHello();
      expect(spy).toHaveBeenCalled();
    });

    it('should return a string', () => {
      const result = appController.getHello();
      expect(typeof result).toBe('string');
    });
  });

  describe('getHealth', () => {
    it('should return health status object', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result.status).toBe('ok');
    });

    it('should return valid timestamp', () => {
      const result = appController.getHealth();
      const timestamp = new Date(result.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });
});
