import { Controller, Get, Req, ForbiddenException } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../database/prisma.service';
import { Public } from '../common/decorators';
import type { FastifyRequest } from 'fastify';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get('live')
  @Public()
  checkLive() {
    return { status: 'up' };
  }

  @Get('ready')
  @Public()
  @HealthCheck()
  checkReady(@Req() request: FastifyRequest) {
    const remoteAddress = request.raw.socket.remoteAddress;
    const allowedIps = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

    if (!remoteAddress || !allowedIps.includes(remoteAddress)) {
      throw new ForbiddenException(
        'Only local connections are allowed for readiness check',
      );
    }

    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }
}
