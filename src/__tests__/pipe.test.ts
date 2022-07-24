import { beforeEach, describe, expect, it, vi } from 'vitest';
import { pipe } from '../pipe';
import { stateHandler } from '../state';
import { Request, Response } from '../types';
import { m1, m2, m3, mBreakOnce } from './mock';

describe('pipe', async () => {
  beforeEach(() => {
    stateHandler.dispatch({ type: 'reset' });
    vi.clearAllMocks();
  });

  it('should execute piped middlewares', async () => {
    const req = {} as Request;
    const res = {} as Response;

    expect(await pipe(req, res, [m1, m2, m3], stateHandler)).toEqual({
      m1: 'm1',
      m2: 'm2',
      m3: 'm3',
    });
    expect(m1).toHaveBeenCalledOnce();
    expect(m2).toHaveBeenCalledOnce();
    expect(m3).toHaveBeenCalledOnce();
  });

  it('should terminate if `breakOnce` or `breakALl` is true', async () => {
    const req = {} as Request;
    const res = {} as Response;

    expect(
      await pipe(req, res, [m1, m2, mBreakOnce, m3], stateHandler)
    ).toEqual({
      m1: 'm1',
      m2: 'm2',
    });
  });

  it('should not execute middleware with unmatched path', async () => {
    const req = { nextUrl: { pathname: '/bar' } } as Request;
    const res = {} as Response;

    expect(
      await pipe(
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
