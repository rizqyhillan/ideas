import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { configureApplication } from './../src/app.setup';

describe('HTTP application setup (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApplication(app);
    await app.init();
  });

  it('/ (GET) returns the standard API response envelope', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({
        success: true,
        message: 'Success',
        data: 'Hello World!',
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
