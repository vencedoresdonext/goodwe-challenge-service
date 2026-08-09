import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { HealthModule } from './health.module';
import { DatabaseModule } from '../database/database.module';
import { PrismaService } from '../database/prisma.service';
import { PrismaHealthIndicator } from '@nestjs/terminus';

describe('HealthController (E2E)', () => {
  let app: NestFastifyApplication;

  // Mock Prisma Service
  const mockPrismaService = {
    $connect: async () => {},
    $disconnect: async () => {},
  };

  // Mock PrismaHealthIndicator to always return database is up
  const mockPrismaHealthIndicator = {
    pingCheck: (key: string) => {
      return {
        [key]: {
          status: 'up',
        },
      };
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, HealthModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(PrismaHealthIndicator)
      .useValue(mockPrismaHealthIndicator)
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health/live', async () => {
    const response: {
      body: { status: string };
    } = await supertest(app.getHttpServer()).get('/health/live').expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.status).toBe('up');
  });

  it('GET /health/ready', async () => {
    const response: {
      body: { status: string; info: { database: { status: string } } };
    } = await supertest(app.getHttpServer()).get('/health/ready').expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.status).toBe('ok');
    expect(response.body.info).toHaveProperty('database');
    expect(response.body.info.database.status).toBe('up');
  });
});
