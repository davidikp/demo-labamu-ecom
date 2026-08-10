import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import Canvas from '../section-builder/ui/Canvas';
import { siteTemplateById, defaultPreviewDataFor } from '../section-builder/state/siteTemplates';

/**
 * Full-page "See Preview" for a theme card on the Theme gallery (Online
 * Store > Theme) — a chrome-free, read-only render of that theme's own
 * default home page, at real size (unlike the gallery card's scaled-down
 * canvas). Never a merchant's real content — see `defaultPreviewDataFor`.
 */
export default function ThemePreview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { templateId } = useParams();

  const template = useMemo(() => siteTemplateById(templateId), [templateId]);
  const previewData = useMemo(() => (template ? defaultPreviewDataFor(template) : null), [template]);

  if (!template || !previewData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-sm text-gray-500">
        {t('sectionBuilder:templates.gallery.previewNotFound')}
        <button type="button" onClick={() => navigate('/online-store/theme')} className="text-[#006BFF] hover:underline">
          {t('sectionBuilder:templates.gallery.backToThemes')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => navigate('/online-store/theme')}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#006BFF]"
        >
          <ArrowLeft size={16} />
          {t('sectionBuilder:templates.gallery.backToThemes')}
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-500">
          {t(`sectionBuilder:templates.${template.id}.label`, template.name)}
        </span>
      </div>
      <Canvas
        viewport="desktop"
        header={previewData.header}
        footer={previewData.footer}
        sections={previewData.sections}
        theme={previewData.theme}
        mediaLibrary={previewData.mediaLibrary ?? []}
        selectedId={null}
        readOnly
      />
    </div>
  );
}
