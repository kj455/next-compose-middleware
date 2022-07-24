import { beforeEach, describe, expect, test, vi } from 'vitest';
import { nest } from '../nest';
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
const mbreakOnce = vi.fn(async (req, res, { breakOnce }) => {
  return breakOnce(res);
});
const mbreakAll = vi.fn(async (req, res, { breakAll }) => {
  return breakAll(res);
});

describe('nestMiddleware', () => {
  beforeEach(() => {
    stateHandler.dispatch('reset');
    vi.clearAllMocks();
  });

  test('should execute all scripts', async () => {
    const req = {} as Request;
    const res = {} as Response;

    expect(
      await nest(
        req,
        res,
        {
          scripts: [m1, m2],
          next: {
            scripts: [m3],
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
      m3: 'm3',
      m4: 'm4',
      m5: 'm5',
    });
    expect(m1).toHaveBeenCalledTimes(1);
    expect(m2).toHaveBeenCalledTimes(1);
    expect(m3).toHaveBeenCalledTimes(1);
    expect(m4).toHaveBeenCalledTimes(1);
    expect(m5).toHaveBeenCalledTimes(1);
  });

  test.only('should skip remaining scripts if `brokenOnce` is true', async () => {
    const req = {} as Request;
    const res = {} as Response;

    expect(
      await nest(
        req,
        res,
        {
          scripts: [m1, m2],
          next: {
            scripts: [mbreakOnce, m3],
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

  test.only('should skip all remaining scripts if `brokenAll` is true', async () => {
    const req = {} as Request;
    const res = {} as Response;

    expect(
      await nest(
        req,
        res,
        {
          scripts: [m1, m2],
          next: {
            scripts: [mbreakAll, m3],
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
