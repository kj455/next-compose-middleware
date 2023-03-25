import { beforeEach, describe, expect, test, vi } from 'vitest';
import { compose } from '../compose';
import {
  m1,
  m2,
  m3,
  m4,
  m5,
  m6,
  m7,
  mBreakAll,
  mBreakOnce,
} from '../mocks/middleware';
import { createStore } from '../store';
import { Request, Response } from '../types';

describe('composeMiddleware', () => {
  const store = createStore();
  beforeEach(() => {
    store.dispatch({ type: 'reset' });
    vi.clearAllMocks();
  });

  test('should execute all scripts with matched path', async () => {
    const req = { nextUrl: { pathname: '/foo/bar/baz/qux' } } as Request;
    const res = {} as Response;

    expect(
      await compose(
        req,
        res,
        {
          scripts: [m1, m2, m3],
          '/foo': {
            scripts: [m4],
            '/[id]': {
              scripts: [m5],
              '/baz': {
                scripts: [m6],
              },
            },
          },
          '/bar': [m7],
        },
        store
      )
    ).toEqual({
      m1: 'm1',
      m2: 'm2',
      m3: 'm3',
      m4: 'm4',
      m5: 'm5',
      m6: 'm6',
    });
    expect(m1).toHaveBeenCalledTimes(1);
    expect(m2).toHaveBeenCalledTimes(1);
    expect(m3).toHaveBeenCalledTimes(1);
    expect(m4).toHaveBeenCalledTimes(1);
    expect(m5).toHaveBeenCalledTimes(1);
    expect(m6).toHaveBeenCalledTimes(1);
    expect(m7).toHaveBeenCalledTimes(0);
  });

  test('should skip remaining scripts at same level if `breakOnce` is true', async () => {
    const req = { nextUrl: { pathname: '/foo/bar/baz' } } as Request;
    const res = {} as Response;

    expect(
      await compose(
        req,
        res,
        {
          scripts: [m1, mBreakOnce, m2],
          '/foo': {
            scripts: [m3],
          },
          '/bar': [m4],
        },
        store
      )
    ).toEqual({
      m1: 'm1',
      m3: 'm3',
    });
    expect(m1).toHaveBeenCalledTimes(1);
    expect(m2).toHaveBeenCalledTimes(0);
    expect(m3).toHaveBeenCalledTimes(1);
  });

  test('should skip all remaining scripts if `brokenAll` is true', async () => {
    const req = { nextUrl: { pathname: '/foo/bar/baz' } } as Request;
    const res = {} as Response;

    expect(
      await compose(
        req,
        res,
        {
          scripts: [m1, mBreakAll, m2],
          '/foo': {
            scripts: [m3],
          },
          '/bar': [m4],
        },
        store
      )
    ).toEqual({
      m1: 'm1',
    });
    expect(m1).toHaveBeenCalledTimes(1);
    expect(m2).toHaveBeenCalledTimes(0);
    expect(m3).toHaveBeenCalledTimes(0);
    expect(m4).toHaveBeenCalledTimes(0);
  });
});
