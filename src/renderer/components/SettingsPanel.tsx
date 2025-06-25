import React, { useState, useEffect } from 'react';

const { ipcRenderer } = window.require('electron');

export const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState({
    tinyLlamaEndpoint: 'http://localhost:8081',
    llavaEndpoint: 'http://localhost:8082',
    whisperEndpoint: 'http://localhost:8080',
    obsidianVaultPath: '',
    autoStartRecording: false,
    transcriptionInterval: 5,
    darkMode: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const config = await ipcRenderer.invoke('get-config');
      if (config) {
        setSettings(prev => ({ ...prev, ...config }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    try {
      // Save settings logic would go here
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <div className="settings-panel">
      <div className="settings-section">
        <h3>AI Services</h3>
        
        <div className="form-group">
          <label className="form-label">TinyLLama Endpoint</label>
          <input
            type="text"
            className="form-input"
            value={settings.tinyLlamaEndpoint}
            onChange={(e) => handleSettingChange('tinyLlamaEndpoint', e.target.value)}
            placeholder="http://localhost:8081"
          />
        </div>

        <div className="form-group">
          <label className="form-label">LLaVa Endpoint</label>
          <input
            type="text"
            className="form-input"
            value={settings.llavaEndpoint}
            onChange={(e) => handleSettingChange('llavaEndpoint', e.target.value)}
            placeholder="http://localhost:8082"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Whisper.cpp Endpoint</label>
          <input
            type="text"
            className="form-input"
            value={settings.whisperEndpoint}
            onChange={(e) => handleSettingChange('whisperEndpoint', e.target.value)}
            placeholder="http://localhost:8080"
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>Obsidian Integration</h3>
        
        <div className="form-group">
          <label className="form-label">Vault Path</label>
          <input
            type="text"
            className="form-input"
            value={settings.obsidianVaultPath}
            onChange={(e) => handleSettingChange('obsidianVaultPath', e.target.value)}
            placeholder="/path/to/your/obsidian/vault"
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>Recording Settings</h3>
        
        <div className="setting-item">
          <div className="setting-label">Auto-start Recording</div>
          <div className="setting-control">
            <div 
              className={`toggle-switch ${settings.autoStartRecording ? 'active' : ''}`}
              onClick={() => handleSettingChange('autoStartRecording', !settings.autoStartRecording)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Transcription Interval (seconds)</label>
          <input
            type="number"
            className="form-input"
            value={settings.transcriptionInterval}
            onChange={(e) => handleSettingChange('transcriptionInterval', parseInt(e.target.value))}
            min="1"
            max="30"
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>Appearance</h3>
        
        <div className="setting-item">
          <div className="setting-label">Dark Mode</div>
          <div className="setting-control">
            <div 
              className={`toggle-switch ${settings.darkMode ? 'active' : ''}`}
              onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <button className="btn btn-primary" onClick={saveSettings}>
          Save Settings
        </button>
      </div>
    </div>
  );
};