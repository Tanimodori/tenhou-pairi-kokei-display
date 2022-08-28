import { describe, it, expect } from 'vitest';
import { mjtiles } from 'src/legacy';

describe('Test mjtiles function', () => {
  it('Should correctly split tiles', () => {
    expect(mjtiles('12m3s0p5z')).toEqual(['1m', '2m', '3s', '0p', '5z']);
  });
});
