import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button';
import Canvas from '../section-builder/ui/Canvas';
import SwitchThemeDialog from '../section-builder/ui/SwitchThemeDialog';
import { SITE_TEMPLATES, defaultPreviewDataFor } from '../section-builder/state/siteTemplates';
import { loadDraft, saveDraft } from '../section-builder/state/storage';
import { applySiteTemplate } from '../section-builder/state/siteTemplateApply';
import { inferActiveTemplateId, isDefaultTheme } from '../section-builder/state/inferActiveTemplate';

// TODO: replace with the real active store id once multi-store routing
// exists — matches the hardcoded id used by Layout.jsx's builder entry.
const STORE_ID = 'demo';

// Canvas's own desktop viewport width (see section-builder/ui/Canvas.jsx),
// scaled down to card size. Approximate for the ~340px-wide gallery card —
// this is a preview, not a pixel-perfect miniature.
const CANVAS_DESKTOP_WIDTH = 1280;
const PREVIEW_SCALE = 0.27;

function TemplatePreviewCanvas({ header, footer, sections, theme, mediaLibrary }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
      <div
        style={{ width: CANVAS_DESKTOP_WIDTH, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left' }}
        className="pointer-events-none"
      >
        <Canvas viewport="desktop" header={header} footer={footer} sections={sections} theme={theme} mediaLibrary={mediaLibrary ?? []} selectedId={null} readOnly />
      </div>
    </div>
  );
}

function TemplateCard({ template, isActive, previewData, onOpen, onSwitch, onSeePreview }) {
  const { t } = useTranslation();
  return (
    <div className="template-card-container">
      <div
        className={'template-card' + (isActive ? ' template-card--active' : '')}
        onClick={() => (isActive ? onOpen(template) : onSwitch(template))}
      >
        <TemplatePreviewCanvas {...previewData} />
        {isActive && (
          <div className="badge-active">{t('sectionBuilder:templates.gallery.activeLabel')}</div>
        )}
        <div className="template-overlay" style={{ flexDirection: 'column', gap: '10px' }}>
          <Button
            variant={isActive ? 'primary' : 'secondary'}
            width="180px"
            onClick={(e) => { e.stopPropagation(); isActive ? onOpen(template) : onSwitch(template); }}
            style={{ padding: '12px 24px', fontSize: '14px' }}
          >
            {isActive ? t('sectionBuilder:templates.gallery.editSite') : t('sectionBuilder:templates.gallery.switchTo')}
          </Button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSeePreview(template); }}
            style={{ background: 'none', border: 'none', padding: '4px 0', fontSize: '13px', fontWeight: 600, color: '#FFFFFF', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {t('sectionBuilder:templates.gallery.seePreview')}
          </button>
        </div>
      </div>
      <div style={{ padding: '0 4px' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#282828' }}>
          {t(`sectionBuilder:templates.${template.id}.label`, template.name)}
        </h3>
        <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', lineHeight: '18px' }}>
          {t(`sectionBuilder:templates.${template.id}.description`, '')}
        </p>
      </div>
    </div>
  );
}

export default function ThemeGallery() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Backfill activeTemplateId for drafts that predate this field (edited
  // before ever visiting this page) by matching the current theme against
  // a known template, and persist it immediately — so the currently-used
  // theme is saved and marked active as soon as this page opens, not just
  // recomputed-and-discarded on every render.
  const [draft, setDraft] = useState(() => {
    const loaded = loadDraft(STORE_ID);
    if (loaded?.activeTemplateId) return loaded;

    if (loaded) {
      const inferredId = inferActiveTemplateId(loaded.theme);
      if (inferredId) {
        const backfilled = { ...loaded, activeTemplateId: inferredId };
        saveDraft(STORE_ID, backfilled);
        return backfilled;
      }
    }

    // No template has ever been chosen and nothing to infer from — either a
    // brand-new store (no draft at all) or an untouched default draft (still
    // the schema's default theme, blank homepage). Rather than showing
    // nothing as active, auto-seed the first template so the gallery — and
    // the site itself — always has one selected. Deliberately conservative:
    // only auto-seeds when the site still looks untouched, so it never
    // clobbers a merchant's real (if unthemed) work.
    const homePage = loaded?.pages?.find((p) => p.id === 'home') ?? loaded?.pages?.[0];
    const looksUntouched = !loaded || ((homePage?.sections?.length ?? 0) === 0 && isDefaultTheme(loaded.theme));
    if (looksUntouched) {
      return applySiteTemplate(STORE_ID, SITE_TEMPLATES[0]);
    }
    return loaded;
  });
  const [pendingTemplate, setPendingTemplate] = useState(null);

  const activeTemplateId = draft?.activeTemplateId ?? null;

  // Active template first (real-site preview), everything else after
  // (canned preview from the template's own default data) — matches the
  // confirmed UX: "active shown first, others shown as illustrative cards".
  const orderedTemplates = useMemo(() => {
    if (!activeTemplateId) return SITE_TEMPLATES;
    const active = SITE_TEMPLATES.find((t2) => t2.id === activeTemplateId);
    if (!active) return SITE_TEMPLATES;
    return [active, ...SITE_TEMPLATES.filter((t2) => t2.id !== activeTemplateId)];
  }, [activeTemplateId]);

  function previewDataFor(template) {
    const isActive = template.id === activeTemplateId;
    if (isActive && draft) {
      const activePage = draft.pages.find((p) => p.id === draft.activePageId) ?? draft.pages[0];
      return {
        header: draft.header,
        footer: draft.footer,
        sections: activePage?.sections ?? [],
        theme: draft.theme,
        mediaLibrary: draft.mediaLibrary,
      };
    }
    // Not active (or nothing applied yet) — illustrative preview built from
    // the template's own default data, never the merchant's real content.
    return defaultPreviewDataFor(template);
  }

  function handleOpen() {
    navigate(`/section-builder/${STORE_ID}`);
  }

  function handleSeePreview(template) {
    navigate(`/online-store/theme/${template.id}/preview`);
  }

  function handleKeepContent() {
    const next = applySiteTemplate(STORE_ID, pendingTemplate, 'restyle');
    setDraft(next);
    setPendingTemplate(null);
  }

  function handleStartFresh() {
    const next = applySiteTemplate(STORE_ID, pendingTemplate, 'seed');
    setDraft(next);
    setPendingTemplate(null);
  }

  return (
    <div style={{ background: '#F4F4F4', height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'Lato', sans-serif" }}>
      <style>{`
        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 32px;
        }
        .template-card-container { display: flex; flex-direction: column; gap: 16px; }
        .template-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #F3F4F6;
          transition: all 0.3s ease;
          cursor: pointer;
          background: #F9FAFB;
        }
        .template-card:hover { transform: translateY(-4px); border-color: #006BFF; box-shadow: 0 12px 24px rgba(0, 107, 255, 0.12); }
        .template-card--active { border-color: #006BFF; box-shadow: 0 0 0 2px rgba(0, 107, 255, 0.25); }
        .template-overlay {
          position: absolute; inset: 0; background: rgba(0, 0, 0, 0.5); opacity: 0;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.2s; backdrop-filter: blur(4px);
        }
        .template-card:hover .template-overlay { opacity: 1; }
        .badge-active {
          position: absolute; top: 16px; right: 16px; padding: 6px 14px; border-radius: 100px;
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;
          background: #006BFF; color: #FFFFFF; z-index: 5;
        }
      `}</style>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <h1 style={{ margin: '0 0 20px', fontSize: '26px', fontWeight: 700, color: '#282828', flexShrink: 0 }}>
          {t('sectionBuilder:templates.gallery.heading')}
        </h1>

        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', flex: 1, minHeight: 0, overflow: 'auto', padding: '24px 20px' }}>
          <p style={{ fontSize: '15px', color: '#6B7280', margin: '0 0 24px 0', maxWidth: '640px' }}>
            {t('sectionBuilder:templates.gallery.subtitle')}
          </p>

          <div className="template-grid">
            {orderedTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isActive={template.id === activeTemplateId}
                previewData={previewDataFor(template)}
                onOpen={handleOpen}
                onSwitch={setPendingTemplate}
                onSeePreview={handleSeePreview}
              />
            ))}
          </div>
        </div>
      </div>

      <SwitchThemeDialog
        open={Boolean(pendingTemplate)}
        templateName={pendingTemplate && t(`sectionBuilder:templates.${pendingTemplate.id}.label`, pendingTemplate.name)}
        onKeepContent={handleKeepContent}
        onStartFresh={handleStartFresh}
        onCancel={() => setPendingTemplate(null)}
      />
    </div>
  );
}
