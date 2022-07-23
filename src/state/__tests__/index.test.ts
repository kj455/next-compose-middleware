import { describe, expect, test } from 'vitest';
import { reducer, stateHandler } from '../index';

describe('state', () => {
  describe('reducer', () => {
    const initialState = { brokenOnce: false, brokenAll: false };

    test('breakOnce', () => {
      expect(reducer(initialState, 'breakOnce')).toEqual({
        brokenOnce: true,
        brokenAll: false,
      });
    });

    test('breakOnce', () => {
      expect(reducer(initialState, 'breakAll')).toEqual({
        brokenOnce: false,
        brokenAll: true,
      });
    });

    test('reset', () => {
      expect(reducer(initialState, 'reset')).toEqual(initialState);
    });
  });

  describe('dispatch', () => {
    const { getState, dispatch } = stateHandler;

    test('should mutate state', () => {
      expect(getState()).toEqual({ brokenOnce: false, brokenAll: false });

      dispatch('breakOnce');

      expect(getState()).toEqual({ brokenOnce: true, brokenAll: false });

      dispatch('breakAll');

      expect(getState()).toEqual({ brokenOnce: true, brokenAll: true });

      dispatch('reset');

      expect(getState()).toEqual({ brokenOnce: false, brokenAll: false });
    });
  });
});
