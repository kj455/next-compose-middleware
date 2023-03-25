import { describe, expect, test } from 'vitest';
import { findPathValue, getDividedPaths, isDynamicPath, toPath } from '../path';

describe('getDividedPaths', () => {
  test.each([
    ['/', []],
    ['/foo', ['foo']],
    ['/foo/bar', ['foo', 'bar']],
    ['/foo/bar/', ['foo', 'bar']],
  ])('getDividedPaths(%s)', (pathname, expected) => {
    expect(getDividedPaths(pathname)).toEqual(expected);
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
