import React, { useState, useEffect } from 'react';

interface Note {
  path: string;
  content: string;
  lastModified: Date;
}

interface NotesPreviewProps {
  note: Note | null;
}

export const NotesPreview: React.FC<NotesPreviewProps> = ({ note }) => {
  const [recentNotes, setRecentNotes] = useState<any[]>([]);

  useEffect(() => {
    loadRecentNotes();
  }, []);

  const loadRecentNotes = async () => {
    // This would load recent notes from the main process
    setRecentNotes([
      { name: 'Meeting_2024-01-15_14-30.md', modified: new Date() },
      { name: 'Meeting_2024-01-14_10-15.md', modified: new Date() },
      { name: 'Meeting_2024-01-12_16-45.md', modified: new Date() }
    ]);
  };

  const openInObsidian = () => {
    // This would trigger opening the current note in Obsidian
    console.log('Opening in Obsidian...');
  };

  return (
    <div className="notes-preview" style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3>Current Meeting Note</h3>
        {note ? (
          <div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>
              {note.path}
            </div>
            <button className="btn btn-primary" onClick={openInObsidian}>
              Open in Obsidian
            </button>
          </div>
        ) : (
          <div style={{ fontSize: '14px', opacity: 0.7 }}>
            No active meeting note. Start recording to create one.
          </div>
        )}
      </div>

      <div>
        <h3 style={{ marginBottom: '16px' }}>Recent Notes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentNotes.map((note, index) => (
            <div 
              key={index}
              style={{
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '500' }}>
                {note.name}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                Modified: {note.modified.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {note && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Preview</h3>
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '16px',
              fontFamily: 'SF Mono, Monaco, monospace',
              fontSize: '12px',
              lineHeight: '1.6',
              maxHeight: '300px',
              overflow: 'auto'
            }}
          >
            {note.content.substring(0, 500)}
            {note.content.length > 500 && '...'}
          </div>
        </div>
      )}
    </div>
  );
};