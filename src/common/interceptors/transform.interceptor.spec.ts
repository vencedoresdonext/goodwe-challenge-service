import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { describe, it, expect } from 'vitest';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap response in data and add default message if not formatted', async () => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler = {
      handle: () => of('test-data'),
    } as CallHandler;

    const result = await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockCallHandler).subscribe(resolve);
    });

    expect(result).toEqual({
      message: 'Success',
      data: 'test-data',
    });
  });

  it('should bypass formatting if response is already formatted', async () => {
    const mockContext = {} as ExecutionContext;
    const preformatted = {
      message: 'Custom Message',
      data: 'custom-data',
    };
    const mockCallHandler = {
      handle: () => of(preformatted),
    } as CallHandler;

    const result = await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockCallHandler).subscribe(resolve);
    });

    expect(result).toEqual(preformatted);
  });

  it('should return empty object on null or undefined response', async () => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler = {
      handle: () => of(undefined),
    } as CallHandler;

    const result = await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockCallHandler).subscribe(resolve);
    });

    expect(result).toEqual({});
  });
});
