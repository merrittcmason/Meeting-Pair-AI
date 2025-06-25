import React from 'react';

interface StatusPanelProps {
  isRecording: boolean;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ isRecording }) => {
  return (
    <div className="status-panel">
      <div className={`status-indicator ${isRecording ? 'recording' : 'idle'}`}>
        {isRecording ? '🎤' : '⏸️'}
      </div>
      
      <div className="status-text">
        {isRecording ? 'Recording Active' : 'Ready to Record'}
      </div>
      
      <div className="status-subtitle">
        {isRecording 
          ? 'Meeting audio is being transcribed in real-time'
          : 'Use the system tray to start recording'
        }
      </div>

      <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '14px', opacity: 0.7 }}>
          <strong>Quick Actions:</strong>
        </div>
        <div style={{ fontSize: '12px', opacity: 0.6 }}>
          • Right-click tray icon to start/stop recording<br/>
          • Use Visual Capture for screenshots<br/>
          • Notes are automatically saved to Obsidian
        </div>
      </div>
    </div>
  );
};