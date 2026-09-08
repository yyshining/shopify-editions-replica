import { describe, it, expect } from 'vitest';
import { getMotion, chooseQuality } from '../lib/motion';
describe('one scroll state for DOM and renderer', () => {
  it('clamps bounce beyond the document', () => {
    expect(getMotion(-100, 720).transition).toBe(0);
    expect(getMotion(100000, 720).paper).toBe(1);
  });
  it('can seek and reverse without hidden history', () => {
    const before = getMotion(500, 720);
    getMotion(4000, 720);
    expect(getMotion(500, 720)).toEqual(before);
  });
  it('reaches a completely legible paper section', () => {
    expect(getMotion(3.5 * 720, 720)).toMatchObject({paper: 1, transition: 1, theme: 'light'});
  });
  it('uses native fallback when the GPU is unavailable', () => {
    expect(chooseQuality(false, false, false)).toBe('static');
    expect(chooseQuality(true, true, false)).toBe('static');
    expect(chooseQuality(true, false, true)).toBe('mobile');
  });
});
