import { themes } from './registry';

/**
 * @module section-builder/themes/themeRoster
 * @description Public roster for the Online Store > Themes "Discover"
 * gallery — separate from `themes/registry.js`, which only holds real,
 * fully-validated theme definitions (currently just Xinear). This roster
 * lists every theme the gallery should display, including planned themes
 * that have no implementation yet ("Coming soon" stubs).
 */
export const THEME_ROSTER = [
  { id: 'xinear', name: 'Xinear', comingSoon: false },
  { id: 'houzez', name: 'Houzez', comingSoon: true },
  { id: 'barger', name: 'Barger', comingSoon: true },
  { id: 'napoli', name: 'Napoli', comingSoon: true },
  { id: 'local', name: 'Local', comingSoon: true },
  { id: 'photostoodio', name: 'PhotoStoodio', comingSoon: true },
  { id: 'medic', name: 'Medic', comingSoon: true },
  { id: 'dekor', name: 'Dekor', comingSoon: true },
];

// Dev-time sanity check — every roster entry marked as real (comingSoon:
// false) must have a matching, fully-validated definition in the theme
// registry. Throws loudly at module load so a rename/removal in registry.js
// that isn't mirrored here fails fast instead of silently breaking the
// gallery (e.g. rendering "Add" for a theme applyThemeToElement can't find).
for (const entry of THEME_ROSTER) {
  if (!entry.comingSoon && !themes[entry.id]) {
    throw new Error(
      `themeRoster: "${entry.id}" is listed as available (comingSoon: false) but has no matching entry in themes/registry.js. Known registry themes: ${Object.keys(themes).join(', ')}`
    );
  }
}
