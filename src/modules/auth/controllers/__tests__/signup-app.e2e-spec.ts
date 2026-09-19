import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { describe, beforeAll, afterAll, it, expect, vi } from 'vitest';
import { SignupAppController } from '../signup-app.controller';
import { SignupService } from '../../services/signup.service';
import { RouteTypeEnum } from '../../../../common/enums/route-type.enum';

describe('SignupAppController (e2e)', () => {
  let app: NestFastifyApplication;
  let signupService: { execute: import('vitest').Mock };

  beforeAll(async () => {
    signupService = {
      execute: vi.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SignupAppController],
      providers: [{ provide: SignupService, useValue: signupService }],
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

  it('/app/signup (POST) - should return 201 and tokens on success', async () => {
    signupService.execute.mockResolvedValue({
      accessToken: 'acc-app',
      refreshToken: 'ref-app',
    });

    const response = await request(app.getHttpServer())
      .post('/app/signup')
      .send({
        email: 'new@app.com',
        password: 'Password@123',
        fullName: 'User App',
        phone: '+5511999999999',
      })
      .expect(201);

    expect(response.body).toEqual({
      data: { accessToken: 'acc-app', refreshToken: 'ref-app' },
    });
    expect(signupService.execute).toHaveBeenCalledWith({
      email: 'new@app.com',
      password: 'Password@123',
      fullName: 'User App',
      phone: '+5511999999999',
      routeType: RouteTypeEnum.APP,
    });
  });

  it('/app/signup (POST) - should return 400 Bad Request if email is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/app/signup')
      .send({ email: 'not-an-email', password: 'Password@123' })
      .expect(400);

    expect((response.body as { message: string[] }).message).toEqual(
      expect.arrayContaining([expect.stringContaining('Email')]),
    );
  });

  it('/app/signup (POST) - should return 400 Bad Request if service throws BadRequestException', async () => {
    signupService.execute.mockRejectedValue(
      new BadRequestException('Email já está em uso'),
    );

    const response = await request(app.getHttpServer())
      .post('/app/signup')
      .send({
        email: 'existing@app.com',
        password: 'Password@123',
        fullName: 'User App',
        phone: '+5511999999999',
      })
      .expect(400);

    expect((response.body as { message: string[] }).message).toBe(
      'Email já está em uso',
    );
  });
});
