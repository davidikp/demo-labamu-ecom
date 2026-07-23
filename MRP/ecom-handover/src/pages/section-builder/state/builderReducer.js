/**
 * @module section-builder/state/builderReducer
 * @description Core reducer for the section-based storefront builder.
 *
 * Owns `{ pages, activePageId, theme, header, footer, selection, mediaLibrary }`
 * for a single store. This is intentionally the *only* mutable model —
 * Phases 3-9 add action types here rather than introducing new state
 * containers, so the Phase 6 undo/redo history wrapper only ever has one
 * shape to snapshot.
 *
 * Header and footer (US-3.6, US-6.6) are stored once, globally — not per
 * page — so editing either one is inherently store-wide; there is no
 * separate "propagate to all pages" step to get wrong. `page.sections` holds
 * only the reorderable, per-page middle sections.
 *
 * `selection` and `mediaLibrary` are excluded from undo history by
 * useSectionBuilder (selection isn't content, and library deletes are
 * confirmed separately per US-9.4) — see TRANSIENT_ACTION_TYPES there.
 */

export const MAX_SECTIONS_PER_PAGE = 20;
export const SECTION_WARNING_THRESHOLD = 18;

export const ACTIONS = {
  SET_ACTIVE_PAGE: 'SET_ACTIVE_PAGE',
  ADD_PAGE: 'ADD_PAGE',
  RENAME_PAGE: 'RENAME_PAGE',
  DELETE_PAGE: 'DELETE_PAGE',
  UPDATE_PAGE_SEO: 'UPDATE_PAGE_SEO',
  TOGGLE_PAGE_NAV_HIDDEN: 'TOGGLE_PAGE_NAV_HIDDEN',
  ADD_SECTION: 'ADD_SECTION',
  REMOVE_SECTION: 'REMOVE_SECTION',
  DUPLICATE_SECTION: 'DUPLICATE_SECTION',
  MOVE_SECTION: 'MOVE_SECTION',
  REORDER_SECTIONS: 'REORDER_SECTIONS',
  UPDATE_SECTION_DATA: 'UPDATE_SECTION_DATA',
  TOGGLE_GLOBAL_HIDDEN: 'TOGGLE_GLOBAL_HIDDEN',
  UPDATE_GLOBAL_DATA: 'UPDATE_GLOBAL_DATA',
  UPDATE_THEME_FIELD: 'UPDATE_THEME_FIELD',
  APPLY_THEME_PRESET: 'APPLY_THEME_PRESET',
  SELECT: 'SELECT',
  DESELECT: 'DESELECT',
  ADD_MEDIA_ITEM: 'ADD_MEDIA_ITEM',
  REMOVE_MEDIA_ITEM: 'REMOVE_MEDIA_ITEM',
};

export function createInitialState({ storeId, pages, theme, header, footer }) {
  return {
    storeId,
    pages,
    activePageId: pages[0]?.id ?? null,
    theme,
    header,
    footer,
    selection: { id: null },
    mediaLibrary: [],
  };
}

function updatePage(pages, pageId, updater) {
  return pages.map((page) => (page.id === pageId ? updater(page) : page));
}

function clampInsertIndex(length, index) {
  if (index == null) return length;
  return Math.max(0, Math.min(index, length));
}

export function builderReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_ACTIVE_PAGE:
      return { ...state, activePageId: action.pageId, selection: { id: null } };

    case ACTIONS.ADD_SECTION: {
      const { pageId, section, index } = action;
      return {
        ...state,
        pages: updatePage(state.pages, pageId, (page) => {
          if (page.sections.length >= MAX_SECTIONS_PER_PAGE) return page;
          const sections = [...page.sections];
          sections.splice(clampInsertIndex(sections.length, index), 0, section);
          return { ...page, sections };
        }),
        selection: { id: section.id },
      };
    }

    case ACTIONS.DUPLICATE_SECTION: {
      const { pageId, sectionId, newId } = action;
      let newSection = null;
      const pages = updatePage(state.pages, pageId, (page) => {
        const idx = page.sections.findIndex((s) => s.id === sectionId);
        if (idx === -1 || page.sections.length >= MAX_SECTIONS_PER_PAGE) return page;
        newSection = { ...page.sections[idx], id: newId, data: { ...page.sections[idx].data } };
        const sections = [...page.sections];
        sections.splice(idx + 1, 0, newSection);
        return { ...page, sections };
      });
      if (!newSection) return state;
      return { ...state, pages, selection: { id: newSection.id } };
    }

    case ACTIONS.REMOVE_SECTION: {
      const { pageId, sectionId } = action;
      return {
        ...state,
        pages: updatePage(state.pages, pageId, (page) => ({
          ...page,
          sections: page.sections.filter((s) => s.id !== sectionId),
        })),
        selection: state.selection.id === sectionId ? { id: null } : state.selection,
      };
    }

    case ACTIONS.MOVE_SECTION: {
      const { pageId, sectionId, direction } = action; // direction: -1 | 1
      return {
        ...state,
        pages: updatePage(state.pages, pageId, (page) => {
          const idx = page.sections.findIndex((s) => s.id === sectionId);
          const targetIdx = idx + direction;
          if (idx === -1 || targetIdx < 0 || targetIdx >= page.sections.length) return page;
          const sections = [...page.sections];
          [sections[idx], sections[targetIdx]] = [sections[targetIdx], sections[idx]];
          return { ...page, sections };
        }),
      };
    }

    case ACTIONS.REORDER_SECTIONS: {
      const { pageId, orderedIds } = action;
      return {
        ...state,
        pages: updatePage(state.pages, pageId, (page) => {
          const byId = new Map(page.sections.map((s) => [s.id, s]));
          return { ...page, sections: orderedIds.map((id) => byId.get(id)) };
        }),
      };
    }

    case ACTIONS.UPDATE_SECTION_DATA: {
      const { pageId, sectionId, data } = action;
      return {
        ...state,
        pages: updatePage(state.pages, pageId, (page) => ({
          ...page,
          sections: page.sections.map((s) =>
            s.id === sectionId ? { ...s, data: { ...s.data, ...data } } : s
          ),
        })),
      };
    }

    case ACTIONS.TOGGLE_GLOBAL_HIDDEN: {
      const { which } = action; // 'header' | 'footer'
      return { ...state, [which]: { ...state[which], hidden: !state[which].hidden } };
    }

    case ACTIONS.UPDATE_GLOBAL_DATA: {
      const { which, data } = action;
      return { ...state, [which]: { ...state[which], data: { ...state[which].data, ...data } } };
    }

    case ACTIONS.UPDATE_THEME_FIELD: {
      const { group, field, value } = action;
      return {
        ...state,
        theme: {
          ...state.theme,
          [group]: { ...state.theme[group], [field]: value },
        },
      };
    }

    case ACTIONS.APPLY_THEME_PRESET: {
      // Presets replace colors and fonts only — never section content,
      // buttons, layout, or product-card settings (US-5.5).
      const { colors, typography } = action;
      return { ...state, theme: { ...state.theme, colors, typography } };
    }

    case ACTIONS.ADD_PAGE:
      return {
        ...state,
        pages: [...state.pages, action.page],
        activePageId: action.page.id,
        selection: { id: null },
      };

    case ACTIONS.RENAME_PAGE:
      return {
        ...state,
        pages: updatePage(state.pages, action.pageId, (page) => ({ ...page, name: action.name })),
      };

    case ACTIONS.DELETE_PAGE: {
      const pages = state.pages.filter((p) => p.id !== action.pageId);
      const activePageId = state.activePageId === action.pageId ? pages[0]?.id ?? null : state.activePageId;
      return { ...state, pages, activePageId };
    }

    case ACTIONS.UPDATE_PAGE_SEO:
      return {
        ...state,
        pages: updatePage(state.pages, action.pageId, (page) => ({
          ...page,
          seo: { ...page.seo, ...action.seo },
        })),
      };

    case ACTIONS.TOGGLE_PAGE_NAV_HIDDEN:
      return {
        ...state,
        pages: updatePage(state.pages, action.pageId, (page) => ({
          ...page,
          hiddenFromNav: !page.hiddenFromNav,
        })),
      };

    case ACTIONS.ADD_MEDIA_ITEM:
      return { ...state, mediaLibrary: [action.item, ...state.mediaLibrary] };

    case ACTIONS.REMOVE_MEDIA_ITEM:
      // Any field still referencing this id (`{ mediaId }`) simply resolves
      // to nothing at render time — see ui/fields/imageValue.js — so there's
      // no section data to clean up here (US-9.4).
      return { ...state, mediaLibrary: state.mediaLibrary.filter((m) => m.id !== action.id) };

    case ACTIONS.SELECT:
      return { ...state, selection: { id: action.id } };

    case ACTIONS.DESELECT:
      return { ...state, selection: { id: null } };

    default:
      return state;
  }
}
