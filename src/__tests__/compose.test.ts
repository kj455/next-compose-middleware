import { beforeEach, describe, expect, test, vi } from 'vitest';
import { compose } from '../compose';
import { stateHandler } from '../state';
import { Request, Response } from '../types';

const m1 = vi.fn(async (req, res) => {
  return { ...res, m1: 'm1' };
});
const m2 = vi.fn(async (req, res) => {
  return { ...res, m2: 'm2' };
});
const m3 = vi.fn(async (req, res) => {
  return { ...res, m3: 'm3' };
});
const m4 = vi.fn(async (req, res) => {
  return { ...res, m4: 'm4' };
});
const m5 = vi.fn(async (req, res) => {
  return { ...res, m5: 'm5' };
});
const mBreakOnce = vi.fn(async (req, res, { breakOnce }) => {
  return breakOnce(res);
});
const mBreakAll = vi.fn(async (req, res, { breakAll }) => {
  return breakAll(res);
});

describe('composeMiddleware', () => {
  beforeEach(() => {
    stateHandler.dispatch('reset');
    vi.clearAllMocks();
  });

  test('should execute all scripts with matched path', async () => {
    const req = {} as Request;
    const res = {} as Response;

    expect(
      await compose(
        req,
        res,
        {
          scripts: [m1, [m2, { matcher: (req) => false }], m3],
          next: {
            scripts: [m4],
            next: {
              scripts: [m5],
            },
          },
        },
        stateHandler
      )
    ).toEqual({
      m1: 'm1',
      m3: 'm3',
      m4: 'm4',
      m5: 'm5',
    });
    expect(m1).toHaveBeenCalledTimes(1);
    expect(m2).toHaveBeenCalledTimes(0);
    expect(m3).toHaveBeenCalledTimes(1);
    expect(m4).toHaveBeenCalledTimes(1);
    expect(m5).toHaveBeenCalledTimes(1);
  });

  test('should not execute scripts if matcher returns false', () => {
    const req = {} as Request;
    const res = {} as Response;

    compose(
      req,
      res,
      {
        scripts: [m1, m2, m3],
        matcher: (req) => false,
        next: {
          scripts: [m4],
          next: {
            scripts: [m5],
          },
        },
      },
      stateHandler
    );
    expect(m1).toHaveBeenCalledTimes(0);
    expect(m2).toHaveBeenCalledTimes(0);
    expect(m3).toHaveBeenCalledTimes(0);
    expect(m4).toHaveBeenCalledTimes(0);
    expect(m5).toHaveBeenCalledTimes(0);
  });

  test('should skip remaining scripts if `brokenOnce` is true', async () => {
    const req = {} as Request;
    const res = {} as Response;

    expect(
      await compose(
        req,
        res,
        {
          scripts: [m1, m2],
          next: {
            scripts: [mBreakOnce, m3],
            next: {
              scripts: [m4, m5],
            },
          },
        },
        stateHandler
      )
    ).toEqual({
      m1: 'm1',
      m2: 'm2',
      m4: 'm4',
      m5: 'm5',
    });
    expect(m1).toHaveBeenCalledTimes(1);
    expect(m2).toHaveBeenCalledTimes(1);
    expect(m3).toHaveBeenCalledTimes(0);
    expect(m4).toHaveBeenCalledTimes(1);
    expect(m5).toHaveBeenCalledTimes(1);
  });

  test('should skip all remaining scripts if `brokenAll` is true', async () => {
    const req = {} as Request;
    const res = {} as Response;

    expect(
      await compose(
        req,
        res,
        {
          scripts: [m1, m2],
          next: {
            scripts: [mBreakAll, m3],
            next: {
              scripts: [m4, m5],
            },
          },
        },
        stateHandler
      )
    ).toEqual({
      m1: 'm1',
      m2: 'm2',
    });
    expect(m1).toHaveBeenCalledTimes(1);
    expect(m2).toHaveBeenCalledTimes(1);
    expect(m3).toHaveBeenCalledTimes(0);
    expect(m4).toHaveBeenCalledTimes(0);
    expect(m5).toHaveBeenCalledTimes(0);
  });
});
