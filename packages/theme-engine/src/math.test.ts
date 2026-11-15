import { describe, expect, it } from 'vitest';
import { mapGaugeScale, unmapGaugeScale } from './math.js';

const scale = { value1: 2000, value2: 4500, position1: 0.32, position2: 0.92 };

describe('piecewise gauge scale', () => {
  it.each([
    [0, 0],
    [2000, 0.32],
    [4000, 0.8],
    [4500, 0.92],
    [5000, 1],
  ])('maps %i to angular fraction %f', (value, expected) => {
    expect(mapGaugeScale(value, 0, 5000, scale)).toBeCloseTo(expected, 8);
  });

  it('clamps values outside the binding range', () => {
    expect(mapGaugeScale(-250, 0, 5000, scale)).toBe(0);
    expect(mapGaugeScale(5250, 0, 5000, scale)).toBe(1);
  });

  it.each([
    [0, 0],
    [0.32, 2000],
    [0.8, 4000],
    [0.92, 4500],
    [1, 5000],
  ])('inverts angular fraction %f to %i rpm', (position, expected) => {
    expect(unmapGaugeScale(position, 0, 5000, scale)).toBeCloseTo(expected, 8);
  });
});
