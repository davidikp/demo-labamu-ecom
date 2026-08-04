import { describe, it, expect } from 'vitest';
import { migrateState } from './migrations';

describe('migrateState — repeater → blocks', () => {
  it('folds a legacy repeater array into typed blocks and drops the old key', () => {
    const legacy = {
      pages: [
        {
          id: 'home',
          sections: [
            {
              id: 'sec1',
              type: 'testimonials',
              data: {
                heading: 'Hi',
                quotes: [
                  { id: 'q1', quote: 'Great', reviewer_name: 'Ada', star_rating: '5' },
                  { id: 'q2', quote: 'Nice', reviewer_name: 'Lin', star_rating: '4' },
                ],
              },
            },
          ],
        },
      ],
    };
    const out = migrateState(legacy);
    const sec = out.pages[0].sections[0];
    expect(sec.data.quotes).toBeUndefined();
    expect(sec.blocks).toHaveLength(2);
    expect(sec.blocks[0]).toEqual({ id: 'q1', type: 'quote', data: { quote: 'Great', reviewer_name: 'Ada', star_rating: '5' } });
    expect(sec.data.heading).toBe('Hi');
  });

  it('is idempotent — a second run leaves already-migrated blocks untouched', () => {
    const legacy = {
      pages: [{ id: 'home', sections: [{ id: 's', type: 'testimonials', data: { quotes: [{ id: 'q1', quote: 'x' }] } }] }],
    };
    const once = migrateState(legacy);
    const twice = migrateState(once);
    expect(twice.pages[0].sections[0].blocks).toHaveLength(1);
    expect(twice).toEqual(once);
  });

  it('handles null / missing pages', () => {
    expect(migrateState(null)).toBeNull();
    expect(migrateState({})).toEqual({});
  });
});

describe('migrateState — content fields → blocks', () => {
  it('folds a Hero heading/subtext/button into content blocks and strips the keys', () => {
    const legacy = {
      pages: [{ id: 'home', sections: [{ id: 's', type: 'hero_banner', data: { heading: 'Hi', subtext: 'Sub', button_label: 'Go', button_url: '/x', background_color: { slot: 'surface' } } }] }],
    };
    const sec = migrateState(legacy).pages[0].sections[0];
    expect(sec.data.heading).toBeUndefined();
    expect(sec.data.button_label).toBeUndefined();
    expect(sec.data.background_color).toEqual({ slot: 'surface' }); // section field kept
    const types = sec.blocks.map((b) => b.type);
    expect(types).toEqual(['heading', 'subheading', 'button']);
    expect(sec.blocks[0].data.text).toBe('Hi');
    expect(sec.blocks[2].data.url).toBe('/x');
  });

  it('is idempotent for content sections', () => {
    const legacy = { pages: [{ id: 'home', sections: [{ id: 's', type: 'rich_text', data: { content: '<p>x</p>' } }] }] };
    const once = migrateState(legacy);
    const twice = migrateState(once);
    expect(twice).toEqual(once);
    expect(once.pages[0].sections[0].blocks).toHaveLength(1);
  });
});
