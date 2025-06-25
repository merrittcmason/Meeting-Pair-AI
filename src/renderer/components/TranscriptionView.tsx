import React, { useEffect, useRef } from 'react';

interface TranscriptionViewProps {
  text: string;
}

export const TranscriptionView: React.FC<TranscriptionViewProps> = ({ text }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new text is added
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [text]);

  return (
    <div className="transcription-view">
      <div className="transcription-header" style={{ marginBottom: '16px' }}>
        <h3>Live Transcription</h3>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>
          Real-time audio transcription and AI processing
        </div>
      </div>
      
      <div 
        ref={contentRef}
        className="transcription-content"
      >
        {text || 'Transcription will appear here when recording starts...'}
      </div>
      
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
          Clear
        </button>
        <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
          Copy
        </button>
        <button className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
          Save to Notes
        </button>
      </div>
    </div>
  );
};