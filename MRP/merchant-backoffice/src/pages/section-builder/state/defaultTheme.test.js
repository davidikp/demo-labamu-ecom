import { describe, it, expect } from 'vitest';
import { defaultTheme } from './defaultTheme';

describe('defaultTheme', () => {
  it('mirrors theme-settings-schema.json defaults for each group', () => {
    expect(defaultTheme.colors.primary).toBe('#1a1a1a');
    expect(defaultTheme.typography.heading_font).toBe('Inter');
    expect(defaultTheme.buttons.corner_radius).toBe(4);
    expect(defaultTheme.layout.section_spacing).toBe('medium');
    expect(defaultTheme.product_cards.sale_badge_style).toBe('percent');
  });
});
