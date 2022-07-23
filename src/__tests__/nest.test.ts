import { describe, expect, test, vi } from 'vitest';
import { nestMiddleware } from '../nest';
import { Request, Response } from '../types';

const m1 = vi.fn(async (req, res) => {
  return { ...res, foo: 'foo' };
});
const m2 = vi.fn(async (req, res) => {
  return { ...res, bar: 'bar' };
});
const m3 = vi.fn(async (req, res) => {
  return { ...res, baz: 'baz' };
});

describe('nestMiddleware', () => {
  test('should return res', async () => {
    const req = {} as Request;
    const res = {} as Response;

    expect(
      await nestMiddleware(req, res, {
        scripts: [m1, m2, m3],
      })
    ).toEqual({
      foo: 'foo',
      bar: 'bar',
      baz: 'baz',
    });
    expect(m1).toHaveBeenCalledOnce();
    expect(m2).toHaveBeenCalledOnce();
    expect(m3).toHaveBeenCalledOnce();
  });
});
