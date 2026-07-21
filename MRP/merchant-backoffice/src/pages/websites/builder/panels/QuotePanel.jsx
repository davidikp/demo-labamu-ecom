import React from 'react';
import { TextField, MediaUploadField } from '../../../../ce-ui';
import LangPillsBar from '../components/LangPillsBar';

const QuotePanel = React.memo(({ rfq, langBarProps, updateConfig, handleQuoteBgFileSelect }) => (
  <div style={{ padding: '32px 48px', width: '100%', boxSizing: 'border-box' }}>
    <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '0px' }}>

      {/* ── General Section ── */}
      <div style={{ marginBottom: '0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>Quote Request Section</h3>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 16px 0' }}>Configure how user see this section.</p>
        <LangPillsBar {...langBarProps} />
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <TextField
              label="Section Title"
              required
              value={rfq?.title || ''}
              onChange={e => updateConfig('rfq', { ...rfq, title: e.target.value })}
              placeholder="Request a Quote"
            />
          </div>
          <div style={{ flex: 1 }}>
            <TextField
              label="Section Description"
              required
              value={rfq?.subtitle || ''}
              onChange={e => updateConfig('rfq', { ...rfq, subtitle: e.target.value })}
              placeholder="Fill out the form below to get a customized quote for your project"
            />
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #F3F4F6', margin: '28px 0' }} />

      {/* ── Background Image ── */}
      <div>
        <MediaUploadField
          label="Background Image"
          maxItems={1}
          maxSizeMB={5}
          items={rfq?.bgImage ? [{ id: 'bg', type: 'image', src: rfq.bgImage, name: 'Background Image' }] : []}
          onAdd={(payload) => handleQuoteBgFileSelect({ target: { files: [payload.file], value: '' } })}
          onReplace={(_id, payload) => handleQuoteBgFileSelect({ target: { files: [payload.file], value: '' } })}
          onRemove={() => updateConfig('rfq', { ...rfq, bgImage: '' })}
        />
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '8px 0 0' }}>If none is set, the default template image will be used.</p>
      </div>

    </div>
  </div>
));

export default QuotePanel;
