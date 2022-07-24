import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { pipeMiddleware, Request as FooRequest } from '../index';
import { stateHandler } from '../state';

const m1 = vi.fn(async (req, res) => {
  return { ...res, m1: 'm1' };
});
const m2 = vi.fn(async (req, res) => {
  return { ...res, m2: 'm2' };
});
const m3 = vi.fn(async (req, res) => {
  return { ...res, m3: 'm3' };
});
const mFinal = vi.fn(async (req, res, { breakOnce }) => {
  return breakOnce();
});

describe('pipe', async () => {
  beforeEach(() => {
    stateHandler.dispatch('reset');
    vi.clearAllMocks();
  });

  it('should execute piped middlewares', async () => {
    const req = {} as FooRequest;
    const res = {} as NextResponse;

    expect(await pipeMiddleware(req, res, [m1, m2, m3], stateHandler)).toEqual({
      m1: 'm1',
      m2: 'm2',
      m3: 'm3',
    });
    expect(m1).toHaveBeenCalledOnce();
    expect(m2).toHaveBeenCalledOnce();
    expect(m3).toHaveBeenCalledOnce();
  });

  it('should terminate if undefined returned', async () => {
    const req = {} as FooRequest;
    const res = {} as NextResponse;

    expect(
      await pipeMiddleware(req, res, [m1, m2, mFinal, m3], stateHandler)
    ).toEqual({
      m1: 'm1',
      m2: 'm2',
    });
  });

  it('should not execute middleware with unmatched path', async () => {
    const req = { nextUrl: { pathname: '/bar' } } as FooRequest;
    const res = {} as NextResponse;

    expect(
      await pipeMiddleware(
        req,
        res,
        [
          [m1, { matcher: (req) => req.nextUrl.pathname === '/foo' }],
          [m2, { matcher: (req) => req.nextUrl.pathname === '/bar' }],
          m3,
        ],
        stateHandler
      )
    ).toEqual({
      m2: 'm2',
      m3: 'm3',
    });
  });
});
