import { beforeEach, describe, expect, it, vi } from 'vitest';
import { m1, m2, m3, mBreakAll, mBreakOnce } from '../mocks/middleware';
import { pipe } from '../pipe';
import { createStore } from '../store';
import { Request, Response } from '../types';

describe('pipe', async () => {
  const store = createStore();
  beforeEach(() => {
    store.dispatch({ type: 'reset' });
    vi.clearAllMocks();
  });

  it('should execute piped middlewares', async () => {
    const req = {} as Request;
    const res = {} as Response;

    expect(await pipe(req, res, [m1, m2, m3], store)).toEqual({
      m1: 'm1',
      m2: 'm2',
      m3: 'm3',
    });
    expect(m1).toHaveBeenCalledOnce();
    expect(m2).toHaveBeenCalledOnce();
    expect(m3).toHaveBeenCalledOnce();
  });

  it('should terminate if `breakOnce` is true', async () => {
    const req = {} as Request;
    const res = {} as Response;

    expect(await pipe(req, res, [m1, m2, mBreakOnce, m3], store)).toEqual({
      m1: 'm1',
      m2: 'm2',
    });
  });

  it('should terminate if `breakAll` is true', async () => {
    const req = {} as Request;
    const res = {} as Response;

    expect(await pipe(req, res, [m1, m2, mBreakAll, m3], store)).toEqual({
      m1: 'm1',
      m2: 'm2',
    });
  });
});
