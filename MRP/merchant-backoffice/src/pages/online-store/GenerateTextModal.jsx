import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, X, TriangleAlert } from 'lucide-react';
import { MainBtn } from '../../ce-ui';

/**
 * Deterministic stand-in for a real Labamu AI call — there is no AI backend
 * wired into this demo, so generation is simulated locally (same philosophy
 * as this app's other "Simulate Event" style features). Typing "fail" or
 * "unavailable" into the prompt is a deliberate escape hatch for exercising
 * the PRD's negative/edge states without a real failing backend.
 */
function simulateGeneration(mode, prompt) {
  const trimmed = prompt.trim();
  const lower = trimmed.toLowerCase();
  if (lower.includes('unavailable')) return { status: 'unavailable' };
  if (lower.includes('fail')) return { status: 'error' };

  if (mode === 'title') {
    const title = trimmed.replace(/\s+/g, ' ');
    return {
      status: 'ok',
      text: title.charAt(0).toUpperCase() + title.slice(1),
    };
  }

  const text = `<p>${trimmed.charAt(0).toUpperCase() + trimmed.slice(1)}. Here's a draft paragraph generated from your prompt — feel free to edit it before publishing.</p><p>It highlights what makes this worth a customer's attention, in a friendly, on-brand tone.</p>`;
  return { status: 'ok', text };
}

/**
 * Shared "Generate text" modal for both the Title field and the Content
 * editor (Rich Text Editor — Generate Text with AI). `mode` controls the
 * copy and the shape of the simulated output; `hasExisting` surfaces the
 * content-editor-only "replace or insert alongside" edge case.
 */
export default function GenerateTextModal({ open, mode, hasExisting, onClose, onApply }) {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | ok | error | unavailable
  const [result, setResult] = useState(null);

  if (!open) return null;

  const reset = () => {
    setPrompt('');
    setState('idle');
    setResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setState('loading');
    setTimeout(() => {
      const outcome = simulateGeneration(mode, prompt);
      if (outcome.status !== 'ok') {
        setState(outcome.status);
        return;
      }
      setResult(outcome.text);
      setState('ok');
    }, 500);
  };

  const applyText = (insertMode) => {
    onApply(result, insertMode);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative w-[480px] max-w-[95vw] rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#8A3FFC]" />
            <h2 className="text-sm font-semibold text-gray-900">
              {mode === 'title'
                ? t('sectionBuilder:onlineStore.pageEditor.generateTitleHeading', 'Generate a title with Labamu AI')
                : t('sectionBuilder:onlineStore.pageEditor.generateContentHeading', 'Generate content with Labamu AI')}
            </h2>
          </div>
          <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-700">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <label className="mb-1.5 block text-xs font-medium text-gray-600">
            {t('sectionBuilder:onlineStore.pageEditor.generatePromptLabel', 'Describe what you want')}
          </label>
          <textarea
            autoFocus
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === 'title'
                ? t('sectionBuilder:onlineStore.pageEditor.generateTitlePlaceholder', 'e.g. A warm about-us page for a family bakery')
                : t('sectionBuilder:onlineStore.pageEditor.generateContentPlaceholder', 'e.g. Explain our shipping and return policy')
            }
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#006BFF]"
          />

          {state === 'error' && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              <TriangleAlert size={14} />
              {t('sectionBuilder:onlineStore.pageEditor.generateError', 'Something went wrong generating text. Please try again.')}
            </div>
          )}
          {state === 'unavailable' && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <TriangleAlert size={14} />
              {t('sectionBuilder:onlineStore.pageEditor.generateUnavailable', 'Labamu AI is unavailable right now. Please try again later.')}
            </div>
          )}

          {state === 'ok' && result && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              {mode === 'title' ? (
                result
              ) : (
                <div dangerouslySetInnerHTML={{ __html: result }} />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          {state === 'ok' && result ? (
            mode === 'content' && hasExisting ? (
              <>
                <MainBtn variant="secondary" size="sm" label={t('sectionBuilder:onlineStore.pageEditor.generateInsert', 'Insert alongside')} onClick={() => applyText('insert')} />
                <MainBtn variant="primary" size="sm" label={t('sectionBuilder:onlineStore.pageEditor.generateReplace', 'Replace content')} onClick={() => applyText('replace')} />
              </>
            ) : (
              <MainBtn variant="primary" size="sm" label={t('sectionBuilder:onlineStore.pageEditor.generateUse', 'Use this')} onClick={() => applyText('replace')} />
            )
          ) : (
            <MainBtn
              variant="primary"
              size="sm"
              label={state === 'loading' ? t('sectionBuilder:onlineStore.pageEditor.generating', 'Generating…') : t('sectionBuilder:onlineStore.pageEditor.generate', 'Generate')}
              onClick={handleGenerate}
              disabled={!prompt.trim() || state === 'loading'}
            />
          )}
        </div>
      </div>
    </div>
  );
}
