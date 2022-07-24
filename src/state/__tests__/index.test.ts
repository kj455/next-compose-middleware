import { describe, expect, test } from 'vitest';
import { reducer, stateHandler } from '../index';

describe('state', () => {
  const initialState = { path: [], brokenOnce: false, brokenAll: false };

  describe('reducer', () => {
    test('setPath', () => {
      expect(
        reducer(initialState, { type: 'setPath', payload: ['foo'] })
      ).toEqual({
        ...initialState,
        path: ['foo'],
      });
    });

    test('breakOnce', () => {
      expect(reducer(initialState, { type: 'breakOnce' })).toEqual({
        ...initialState,
        brokenOnce: true,
      });
    });

    test('breakOnce', () => {
      expect(reducer(initialState, { type: 'breakAll' })).toEqual({
        ...initialState,
        brokenAll: true,
      });
    });

    test('reset', () => {
      expect(reducer(initialState, { type: 'reset' })).toEqual(initialState);
    });
  });

  describe('dispatch', () => {
    const { getState, dispatch } = stateHandler;

    test('should mutate state', () => {
      expect(getState()).toEqual(initialState);

      dispatch({ type: 'breakOnce' });

      expect(getState()).toEqual({ ...initialState, brokenOnce: true });

      dispatch({ type: 'breakAll' });

      expect(getState()).toEqual({
        ...initialState,
        brokenOnce: true,
        brokenAll: true,
      });

      dispatch({ type: 'reset' });

      expect(getState()).toEqual(initialState);
    });
  });
});
