import { describe, it, expect } from 'vitest';
import { builderReducer, createInitialState, ACTIONS, MAX_SECTIONS_PER_PAGE } from './builderReducer';

function makeState() {
  return createInitialState({
    storeId: 'store-1',
    pages: [{ id: 'home', name: 'Home', type: 'system', slug: '/', sections: [], seo: {} }],
    theme: { colors: { primary: '#000' } },
    header: { id: 'header', type: 'header', hidden: false, data: {} },
    footer: { id: 'footer', type: 'footer', hidden: false, data: {} },
  });
}

describe('builderReducer', () => {
  it('adds a section at the given index and selects it', () => {
    const state = makeState();
    const next = builderReducer(state, {
      type: ACTIONS.ADD_SECTION,
      pageId: 'home',
      section: { id: 's1', type: 'hero_banner', data: {} },
      index: 0,
    });
    expect(next.pages[0].sections).toHaveLength(1);
    expect(next.pages[0].sections[0].id).toBe('s1');
    expect(next.selection.id).toBe('s1');
  });

  it('does not add beyond the 20-section cap', () => {
    let state = makeState();
    for (let i = 0; i < MAX_SECTIONS_PER_PAGE; i += 1) {
      state = builderReducer(state, {
        type: ACTIONS.ADD_SECTION,
        pageId: 'home',
        section: { id: `s${i}`, data: {} },
      });
    }
    const next = builderReducer(state, {
      type: ACTIONS.ADD_SECTION,
      pageId: 'home',
      section: { id: 'overflow', data: {} },
    });
    expect(next.pages[0].sections).toHaveLength(MAX_SECTIONS_PER_PAGE);
  });

  it('duplicates a section directly below the original and selects the copy', () => {
    let state = makeState();
    state = builderReducer(state, { type: ACTIONS.ADD_SECTION, pageId: 'home', section: { id: 'a', data: { heading: 'Hi' } } });
    state = builderReducer(state, { type: ACTIONS.ADD_SECTION, pageId: 'home', section: { id: 'b', data: {} } });
    const next = builderReducer(state, { type: ACTIONS.DUPLICATE_SECTION, pageId: 'home', sectionId: 'a', newId: 'a-copy' });
    const ids = next.pages[0].sections.map((s) => s.id);
    expect(ids).toEqual(['a', 'a-copy', 'b']);
    expect(next.selection.id).toBe('a-copy');
  });

  it('reorders sections by id list', () => {
    let state = makeState();
    state = builderReducer(state, { type: ACTIONS.ADD_SECTION, pageId: 'home', section: { id: 'a' } });
    state = builderReducer(state, { type: ACTIONS.ADD_SECTION, pageId: 'home', section: { id: 'b' } });
    const next = builderReducer(state, {
      type: ACTIONS.REORDER_SECTIONS,
      pageId: 'home',
      orderedIds: ['b', 'a'],
    });
    expect(next.pages[0].sections.map((s) => s.id)).toEqual(['b', 'a']);
  });

  it('moves a section up/down and is a no-op at the boundaries', () => {
    let state = makeState();
    state = builderReducer(state, { type: ACTIONS.ADD_SECTION, pageId: 'home', section: { id: 'a' } });
    state = builderReducer(state, { type: ACTIONS.ADD_SECTION, pageId: 'home', section: { id: 'b' } });

    let next = builderReducer(state, { type: ACTIONS.MOVE_SECTION, pageId: 'home', sectionId: 'a', direction: 1 });
    expect(next.pages[0].sections.map((s) => s.id)).toEqual(['b', 'a']);

    const noop = builderReducer(next, { type: ACTIONS.MOVE_SECTION, pageId: 'home', sectionId: 'b', direction: -1 });
    expect(noop.pages[0].sections.map((s) => s.id)).toEqual(['b', 'a']);
  });

  it('removes a section and clears selection if it was selected', () => {
    let state = makeState();
    state = builderReducer(state, { type: ACTIONS.ADD_SECTION, pageId: 'home', section: { id: 'a' } });
    const next = builderReducer(state, { type: ACTIONS.REMOVE_SECTION, pageId: 'home', sectionId: 'a' });
    expect(next.pages[0].sections).toHaveLength(0);
    expect(next.selection.id).toBeNull();
  });

  it('merges partial data on UPDATE_SECTION_DATA without touching other fields', () => {
    let state = makeState();
    state = builderReducer(state, {
      type: ACTIONS.ADD_SECTION,
      pageId: 'home',
      section: { id: 'a', data: { heading: 'Hi', subtext: 'Sub' } },
    });
    const next = builderReducer(state, {
      type: ACTIONS.UPDATE_SECTION_DATA,
      pageId: 'home',
      sectionId: 'a',
      data: { heading: 'Hello' },
    });
    expect(next.pages[0].sections[0].data).toEqual({ heading: 'Hello', subtext: 'Sub' });
  });

  it('toggles header/footer hidden without affecting the other', () => {
    let state = makeState();
    const next = builderReducer(state, { type: ACTIONS.TOGGLE_GLOBAL_HIDDEN, which: 'header' });
    expect(next.header.hidden).toBe(true);
    expect(next.footer.hidden).toBe(false);
  });

  it('applies a theme preset to colors and typography only, leaving buttons/layout untouched', () => {
    let state = makeState();
    state = { ...state, theme: { ...state.theme, buttons: { corner_radius: 4 }, layout: { section_spacing: 'medium' } } };
    const next = builderReducer(state, {
      type: ACTIONS.APPLY_THEME_PRESET,
      colors: { primary: '#111111' },
      typography: { heading_font: 'Lora' },
    });
    expect(next.theme.colors).toEqual({ primary: '#111111' });
    expect(next.theme.typography).toEqual({ heading_font: 'Lora' });
    expect(next.theme.buttons).toEqual({ corner_radius: 4 });
    expect(next.theme.layout).toEqual({ section_spacing: 'medium' });
  });

  it('updates a single theme field within its group without affecting others', () => {
    let state = makeState();
    state = { ...state, theme: { colors: { primary: '#000', accent: '#fff' } } };
    const next = builderReducer(state, {
      type: ACTIONS.UPDATE_THEME_FIELD,
      group: 'colors',
      field: 'primary',
      value: '#123456',
    });
    expect(next.theme.colors).toEqual({ primary: '#123456', accent: '#fff' });
  });

  it('adds a page, makes it active, and clears selection', () => {
    const state = makeState();
    const next = builderReducer(state, {
      type: ACTIONS.ADD_PAGE,
      page: { id: 'about', name: 'About', type: 'custom', slug: 'about', sections: [], seo: {} },
    });
    expect(next.pages.map((p) => p.id)).toEqual(['home', 'about']);
    expect(next.activePageId).toBe('about');
  });

  it('renames a page without touching its slug', () => {
    let state = makeState();
    state = builderReducer(state, {
      type: ACTIONS.ADD_PAGE,
      page: { id: 'about', name: 'About', type: 'custom', slug: 'about', sections: [], seo: {} },
    });
    const next = builderReducer(state, { type: ACTIONS.RENAME_PAGE, pageId: 'about', name: 'About Us' });
    const page = next.pages.find((p) => p.id === 'about');
    expect(page.name).toBe('About Us');
    expect(page.slug).toBe('about');
  });

  it('deletes a page and falls back to the first remaining page if it was active', () => {
    let state = makeState();
    state = builderReducer(state, {
      type: ACTIONS.ADD_PAGE,
      page: { id: 'about', name: 'About', type: 'custom', slug: 'about', sections: [], seo: {} },
    });
    const next = builderReducer(state, { type: ACTIONS.DELETE_PAGE, pageId: 'about' });
    expect(next.pages.map((p) => p.id)).toEqual(['home']);
    expect(next.activePageId).toBe('home');
  });

  it('merges partial SEO data for a page', () => {
    let state = makeState();
    state = { ...state, pages: [{ ...state.pages[0], seo: { metaTitle: 'Home' } }] };
    const next = builderReducer(state, {
      type: ACTIONS.UPDATE_PAGE_SEO,
      pageId: 'home',
      seo: { metaDescription: 'Welcome' },
    });
    expect(next.pages[0].seo).toEqual({ metaTitle: 'Home', metaDescription: 'Welcome' });
  });

  it('toggles a page hidden-from-nav flag', () => {
    const state = makeState();
    const next = builderReducer(state, { type: ACTIONS.TOGGLE_PAGE_NAV_HIDDEN, pageId: 'home' });
    expect(next.pages[0].hiddenFromNav).toBe(true);
  });

  it('adds a media item to the front of the library', () => {
    let state = makeState();
    state = builderReducer(state, { type: ACTIONS.ADD_MEDIA_ITEM, item: { id: 'm1', filename: 'a.png' } });
    const next = builderReducer(state, { type: ACTIONS.ADD_MEDIA_ITEM, item: { id: 'm2', filename: 'b.png' } });
    expect(next.mediaLibrary.map((m) => m.id)).toEqual(['m2', 'm1']);
  });

  it('removes a media item by id', () => {
    let state = makeState();
    state = builderReducer(state, { type: ACTIONS.ADD_MEDIA_ITEM, item: { id: 'm1', filename: 'a.png' } });
    const next = builderReducer(state, { type: ACTIONS.REMOVE_MEDIA_ITEM, id: 'm1' });
    expect(next.mediaLibrary).toHaveLength(0);
  });

  it('select and deselect update the selection', () => {
    let state = makeState();
    state = builderReducer(state, { type: ACTIONS.SELECT, id: 'a' });
    expect(state.selection.id).toBe('a');
    state = builderReducer(state, { type: ACTIONS.DESELECT });
    expect(state.selection.id).toBeNull();
  });
});
