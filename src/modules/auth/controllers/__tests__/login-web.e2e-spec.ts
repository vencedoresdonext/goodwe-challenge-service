import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, beforeAll, afterAll, it, expect, vi } from 'vitest';
import { LoginWebController } from '../login-web.controller';
import { LoginService } from '../../services/login.service';
import { RouteTypeEnum } from '../../../../common/enums/route-type.enum';

describe('LoginWebController (e2e)', () => {
  let app: NestFastifyApplication;
  let loginService: { execute: import('vitest').Mock };

  beforeAll(async () => {
    loginService = {
      execute: vi.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [LoginWebController],
      providers: [{ provide: LoginService, useValue: loginService }],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/web/login (POST) - should return 201 and tokens on success', async () => {
    loginService.execute.mockResolvedValue({
      accessToken: 'access-web',
      refreshToken: 'refresh-web',
    });

    const response = await request(app.getHttpServer())
      .post('/web/login')
      .send({ email: 'test@web.com', password: 'Password@123' })
      .expect(201);

    expect(response.body).toEqual({
      data: { accessToken: 'access-web', refreshToken: 'refresh-web' },
    });
    expect(loginService.execute).toHaveBeenCalledWith({
      email: 'test@web.com',
      password: 'Password@123',
      routeType: RouteTypeEnum.WEB,
    });
  });

  it('/web/login (POST) - should return 400 Bad Request if email is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/web/login')
      .send({ email: 'not-an-email', password: 'Password@123' })
      .expect(400);

    expect((response.body as { message: string[] }).message).toEqual(
      expect.arrayContaining([expect.stringContaining('Email')]),
    );
  });
});
