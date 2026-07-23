import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SECTION_DEFINITIONS } from './index';
import { defaultTheme } from '../state/defaultTheme';

/**
 * Renders every Epic 11 section (Header/Footer + the 12 MVP types) with
 * empty data against the default theme — the "every component must be
 * useful on day one" principle (component design rule #2) as an automated
 * check rather than a manual click-through of all 14 in a browser.
 */
describe('section renderers', () => {
  for (const [type, { Renderer }] of Object.entries(SECTION_DEFINITIONS)) {
    it(`${type} renders with empty data and default theme without crashing`, () => {
      const { container } = render(
        <Renderer data={{}} theme={defaultTheme} mediaLibrary={[]} isBuilder />
      );
      expect(container.firstChild).not.toBeNull();
    });
  }
});
