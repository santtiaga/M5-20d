import { describe, expect, it } from 'vitest';
import { createComponent, createEmptyTheme, type Theme } from '@idv7lol/theme-schema';
import { compileTheme, lintShader, SHADERS, validateTheme } from './index.js';

function theme(components: Theme['components']): Theme {
  return { ...createEmptyTheme({ id: 'tachometer-spec', name: 'Tachometer spec' }), components };
}

describe('nonlinear GPU tachometer', () => {
  it('compiles one static track and one dynamic fill/needle layer', () => {
    const gauge = createComponent('gauge.arc', {
      id: 'tacho',
      x: 500,
      y: 100,
      width: 500,
      height: 500,
      binding: { signal: 'engine.rpm', min: 0, max: 5000 },
      props: {
        scale: { value1: 2000, value2: 4500, position1: 0.32, position2: 0.92 },
        ticks: { major: 0 },
        labels: { show: false },
        needle: { show: true },
        fill: {
          zones: [
            { from: 0, to: 2000, color: '$success' },
            { from: 2000, to: 4000, color: '$accent' },
            { from: 4000, to: 4500, color: '$warning' },
            { from: 4500, to: 5000, color: '$danger' },
          ],
        },
      },
    });
    const report = validateTheme(theme([gauge]));
    expect(report.errors).toEqual([]);
    const result = compileTheme(theme([gauge]));
    expect(result.report.errors).toEqual([]);
    if (!result.compiled) throw new Error('theme did not compile');
    const track = result.compiled.pieces.find((p) => p.key === 'tacho:track');
    const dynamic = result.compiled.pieces.find((p) => p.key === 'tacho:tachometer');
    expect(track?.shader).toBe('arc-band');
    expect(dynamic?.shader).toBe('tachometer');
    expect(dynamic?.statics.u_scale).toEqual([0.4, 0.9, 0.32, 0.92]);
    expect(dynamic?.dynamics).toContainEqual(
      expect.objectContaining({ kind: 'norm', uniform: 'u_rpm' }),
    );
    expect(result.compiled.shaders.tachometer).toBe(SHADERS.tachometer);
  });

  it('uses a GLSL ES 1.00 shader within the renderer uniform budget', () => {
    expect(lintShader(SHADERS.tachometer)).toEqual([]);
    expect(SHADERS.tachometer).toContain('uniform float u_rpm');
    expect(SHADERS.tachometer).toContain('float unmapScale');
  });
});
