import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  compose,
  findPathValue,
  getPathList,
  isDynamicPath,
  toPath,
} from '../compose';
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
import { stateHandler } from '../state';
import { Request, Response } from '../types';

describe('getPathList', () => {
  test.each([
    ['/', []],
    ['/foo', ['foo']],
    ['/foo/bar', ['foo', 'bar']],
    ['/foo/bar/', ['foo', 'bar']],
  ])('getPathList(%s)', (pathname, expected) => {
    expect(getPathList(pathname)).toEqual(expected);
  });
});

describe('toPath', () => {
  test.each([
    ['', '/'],
    ['foo', '/foo'],
    ['foo/bar', '/foo/bar'],
    ['/foo/bar', '/foo/bar'],
  ])('toPath(%s)', (str, expected) => {
    expect(toPath(str)).toEqual(expected);
  });
});

describe('isDynamicPath', () => {
  test.each([
    ['/', false],
    ['/foo', false],
    ['/[id]', true],
    ['/[fooBar]', true],
  ])('isDynamicPath(%s)', (pathname, expected) => {
    expect(isDynamicPath(pathname)).toEqual(expected);
  });
});

describe('findPathValue', () => {
  test.each([
    [{ '/foo': [], '/bar': {} }, '/foo', []],
    [{ '/foo': [], '/bar': {} }, '/baz', null],
    [{ '/[id]': [], '/bar': {} }, '/qux', []],
  ])('findPathValue(%s)', (pathMap, path, expected) => {
    // @ts-expect-error
    expect(findPathValue(pathMap, path)).toEqual(expected);
  });
});

describe('composeMiddleware', () => {
  beforeEach(() => {
    stateHandler.dispatch({ type: 'reset' });
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
          scripts: [m1, [m2, { matcher: (req) => false }], m3],
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
        stateHandler
      )
    ).toEqual({
      m1: 'm1',
      m3: 'm3',
      m4: 'm4',
      m5: 'm5',
      m6: 'm6',
    });
    expect(m1).toHaveBeenCalledTimes(1);
    expect(m2).toHaveBeenCalledTimes(0);
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
        stateHandler
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
        stateHandler
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
