import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { describe, beforeAll, afterAll, it, expect, vi } from 'vitest';
import { RefreshWebController } from '../refresh-web.controller';
import { RefreshService } from '../../services/refresh.service';
import { RouteTypeEnum } from '../../../../common/enums/route-type.enum';

describe('RefreshWebController (e2e)', () => {
  let app: NestFastifyApplication;
  let refreshService: { execute: import('vitest').Mock };

  beforeAll(async () => {
    refreshService = {
      execute: vi.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RefreshWebController],
      providers: [{ provide: RefreshService, useValue: refreshService }],
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

  it('/web/refresh (POST) - should return 201 and new tokens on success', async () => {
    refreshService.execute.mockResolvedValue({
      accessToken: 'new-acc-web',
      refreshToken: 'new-ref-web',
    });

    const response = await request(app.getHttpServer())
      .post('/web/refresh')
      .send({ refreshToken: 'valid-token' })
      .expect(201);

    expect(response.body).toEqual({
      data: { accessToken: 'new-acc-web', refreshToken: 'new-ref-web' },
    });
    expect(refreshService.execute).toHaveBeenCalledWith({
      refreshToken: 'valid-token',
      routeType: RouteTypeEnum.WEB,
    });
  });

  it('/web/refresh (POST) - should return 400 if refreshToken is missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/web/refresh')
      .send({})
      .expect(400);

    expect((response.body as { message: string[] }).message).toEqual(
      expect.arrayContaining([expect.stringContaining('refreshToken')]),
    );
  });

  it('/web/refresh (POST) - should return 401 if service throws UnauthorizedException', async () => {
    refreshService.execute.mockRejectedValue(
      new UnauthorizedException('Token inválido'),
    );

    const response = await request(app.getHttpServer())
      .post('/web/refresh')
      .send({ refreshToken: 'invalid-token' })
      .expect(401);

    expect((response.body as { message: string[] }).message).toBe(
      'Token inválido',
    );
  });
});
