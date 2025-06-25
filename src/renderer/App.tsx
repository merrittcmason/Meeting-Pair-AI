import React, { useState, useEffect } from 'react';
import { StatusPanel } from './components/StatusPanel';
import { TranscriptionView } from './components/TranscriptionView';
import { SettingsPanel } from './components/SettingsPanel';
import { NotesPreview } from './components/NotesPreview';

const { ipcRenderer } = window.require('electron');

interface AppState {
  currentView: 'status' | 'transcription' | 'settings' | 'notes';
  isRecording: boolean;
  isDarkMode: boolean;
  transcriptionText: string;
  currentNote: any;
}

function App() {
  const [state, setState] = useState<AppState>({
    currentView: 'status',
    isRecording: false,
    isDarkMode: true,
    transcriptionText: '',
    currentNote: null
  });

  useEffect(() => {
    // Listen for theme changes
    ipcRenderer.on('theme-changed', (event, isDark) => {
      setState(prev => ({ ...prev, isDarkMode: isDark }));
    });

    // Listen for transcription updates
    ipcRenderer.on('transcription-update', (event, text) => {
      setState(prev => ({ 
        ...prev, 
        transcriptionText: prev.transcriptionText + '\n' + text 
      }));
    });

    return () => {
      ipcRenderer.removeAllListeners('theme-changed');
      ipcRenderer.removeAllListeners('transcription-update');
    };
  }, []);

  const handleViewChange = (view: AppState['currentView']) => {
    setState(prev => ({ ...prev, currentView: view }));
  };

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'transcription':
        return <TranscriptionView text={state.transcriptionText} />;
      case 'settings':
        return <SettingsPanel />;
      case 'notes':
        return <NotesPreview note={state.currentNote} />;
      default:
        return <StatusPanel isRecording={state.isRecording} />;
    }
  };

  return (
    <div className={`app ${state.isDarkMode ? 'dark' : 'light'}`}>
      <div className="app-header">
        <h1>Meeting Pair AI</h1>
        <div className="nav-buttons">
          <button 
            className={state.currentView === 'status' ? 'active' : ''}
            onClick={() => handleViewChange('status')}
          >
            Status
          </button>
          <button 
            className={state.currentView === 'transcription' ? 'active' : ''}
            onClick={() => handleViewChange('transcription')}
          >
            Live
          </button>
          <button 
            className={state.currentView === 'notes' ? 'active' : ''}
            onClick={() => handleViewChange('notes')}
          >
            Notes
          </button>
          <button 
            className={state.currentView === 'settings' ? 'active' : ''}
            onClick={() => handleViewChange('settings')}
          >
            Settings
          </button>
        </div>
      </div>
      
      <div className="app-content">
        {renderCurrentView()}
      </div>
    </div>
  );
}

export default App;