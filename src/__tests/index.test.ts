import { NextRequest, NextResponse } from 'next/server';
import { describe, it, expect, vi } from 'vitest';
import {
  PipeableMiddleware,
  pipeMiddleware,
  Request as FooRequest,
} from '../index';

const m1 = vi.fn(async (req, res) => {
  return { ...res, foo: 'foo' };
});
const m2 = vi.fn(async (req, res) => {
  return { ...res, bar: 'bar' };
});
const m3 = vi.fn(async (req, res) => {
  return { ...res, baz: 'baz' };
});
const mFinal = vi.fn(async (req, res) => {
  return { res, _final: true };
});

describe('pipeMiddleware', () => {
  it('should execute piped middlewares', async () => {
    const req = {} as FooRequest;
    const res = {} as NextResponse;

    expect(await pipeMiddleware(req, res, [m1, m2, m3])).toEqual({
      foo: 'foo',
      bar: 'bar',
      baz: 'baz',
    });
    expect(m1).toHaveBeenCalledOnce();
    expect(m2).toHaveBeenCalledOnce();
    expect(m3).toHaveBeenCalledOnce();
  });

  it('should terminate if given FinalResponse', async () => {
    const req = {} as FooRequest;
    const res = {} as NextResponse;

    expect(await pipeMiddleware(req, res, [m1, m2, mFinal, m3])).toEqual({
      foo: 'foo',
      bar: 'bar',
    });
  });

  it('should not execute middleware with unmatched path', async () => {
    const req = { nextUrl: { pathname: '/top' } } as FooRequest;
    const res = {} as NextResponse;

    expect(
      await pipeMiddleware(req, res, [
        m1,
        [m2, { matcher: (path) => path === '/top' }],
        m3,
      ])
    ).toEqual({
      foo: 'foo',
      baz: 'baz',
    });
  });
});
