import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /', () => {
    it('should return "Hello World!"', async () => {
      const response = await request(app.getHttpServer())
        .get('/')
        .expect(200);
      expect(response.text).toBe('Hello World!');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.status).toBe('ok');
    });
  });

  describe('GET /api', () => {
    it('should return Swagger UI HTML', async () => {
      const response = await request(app.getHttpServer())
        .get('/api')
        .expect(200);
      
      expect(response.text).toContain('Swagger UI');
      expect(response.text).toContain('swagger-ui');
    });
  });
});
