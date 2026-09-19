import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { describe, beforeAll, afterAll, it, expect, vi } from 'vitest';
import { SignupWebController } from '../signup-web.controller';
import { SignupService } from '../../services/signup.service';
import { RouteTypeEnum } from '../../../../common/enums/route-type.enum';

describe('SignupWebController (e2e)', () => {
  let app: NestFastifyApplication;
  let signupService: { execute: import('vitest').Mock };

  beforeAll(async () => {
    signupService = {
      execute: vi.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SignupWebController],
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

  it('/web/signup (POST) - should return 201 and tokens on success', async () => {
    signupService.execute.mockResolvedValue({
      accessToken: 'acc-web',
      refreshToken: 'ref-web',
    });

    const response = await request(app.getHttpServer())
      .post('/web/signup')
      .send({
        email: 'new@web.com',
        password: 'Password@123',
        fullName: 'User Web',
        phone: '+5511999999998',
      })
      .expect(201);

    expect(response.body).toEqual({
      data: { accessToken: 'acc-web', refreshToken: 'ref-web' },
    });
    expect(signupService.execute).toHaveBeenCalledWith({
      email: 'new@web.com',
      password: 'Password@123',
      fullName: 'User Web',
      phone: '+5511999999998',
      routeType: RouteTypeEnum.WEB,
    });
  });

  it('/web/signup (POST) - should return 400 Bad Request if email is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/web/signup')
      .send({ email: 'not-an-email', password: 'Password@123' })
      .expect(400);

    expect((response.body as { message: string[] }).message).toEqual(
      expect.arrayContaining([expect.stringContaining('Email')]),
    );
  });

  it('/web/signup (POST) - should return 400 Bad Request if service throws BadRequestException', async () => {
    signupService.execute.mockRejectedValue(
      new BadRequestException('Email já está em uso'),
    );

    const response = await request(app.getHttpServer())
      .post('/web/signup')
      .send({
        email: 'existing@web.com',
        password: 'Password@123',
        fullName: 'User Web',
        phone: '+5511999999998',
      })
      .expect(400);

    expect((response.body as { message: string[] }).message).toBe(
      'Email já está em uso',
    );
  });
});
