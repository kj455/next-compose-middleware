import { vi } from 'vitest';

export const m1 = vi.fn(async (req, res) => {
  return { ...res, m1: 'm1' };
});
export const m2 = vi.fn(async (req, res) => {
  return { ...res, m2: 'm2' };
});
export const m3 = vi.fn(async (req, res) => {
  return { ...res, m3: 'm3' };
});
export const m4 = vi.fn(async (req, res) => {
  return { ...res, m4: 'm4' };
});
export const m5 = vi.fn(async (req, res) => {
  return { ...res, m5: 'm5' };
});
export const m6 = vi.fn(async (req, res) => {
  return { ...res, m6: 'm6' };
});
export const m7 = vi.fn(async (req, res) => {
  return { ...res, m7: 'm7' };
});
export const mBreakOnce = vi.fn(async (req, res, { breakOnce }) => {
  return breakOnce(res);
});
export const mBreakAll = vi.fn(async (req, res, { breakAll }) => {
  return breakAll(res);
});
