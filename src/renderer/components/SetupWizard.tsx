import React, { useState } from 'react';

const { ipcRenderer } = window.require('electron');

interface SetupConfig {
  tinyLlamaEndpoint: string;
  llavaEndpoint: string;
  whisperEndpoint: string;
  obsidianVaultPath: string;
}

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<SetupConfig>({
    tinyLlamaEndpoint: 'http://localhost:8081',
    llavaEndpoint: 'http://localhost:8082',
    whisperEndpoint: 'http://localhost:8080',
    obsidianVaultPath: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (key: keyof SetupConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const completeSetup = async () => {
    setIsLoading(true);
    try {
      const result = await ipcRenderer.invoke('complete-setup', config);
      if (result.success) {
        // Setup completed successfully
        console.log('Setup completed');
      } else {
        console.error('Setup failed:', result.error);
      }
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectVaultPath = async () => {
    // This would open a folder selection dialog
    const path = '/Users/username/Documents/ObsidianVault';
    handleInputChange('obsidianVaultPath', path);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="setup-step">
            <div className="step-title">Welcome to Meeting Pair AI</div>
            <div className="step-description">
              Let's set up your AI-powered meeting assistant. We'll configure the AI services and integrations you need.
            </div>
            
            <div style={{ marginTop: '32px' }}>
              <h4 style={{ marginBottom: '16px' }}>Features:</h4>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>Real-time audio transcription with Whisper.cpp</li>
                <li>Intelligent text processing with TinyLLama</li>
                <li>Visual content analysis with LLaVa</li>
                <li>Direct Obsidian integration for note-taking</li>
                <li>Secure local storage of your data</li>
              </ul>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="setup-step">
            <div className="step-title">AI Service Configuration</div>
            <div className="step-description">
              Configure the endpoints for your AI services. Make sure these services are running locally.
            </div>

            <div className="form-group">
              <label className="form-label">Whisper.cpp Endpoint</label>
              <input
                type="text"
                className="form-input"
                value={config.whisperEndpoint}
                onChange={(e) => handleInputChange('whisperEndpoint', e.target.value)}
                placeholder="http://localhost:8080"
              />
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                For real-time audio transcription
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">TinyLLama Endpoint</label>
              <input
                type="text"
                className="form-input"
                value={config.tinyLlamaEndpoint}
                onChange={(e) => handleInputChange('tinyLlamaEndpoint', e.target.value)}
                placeholder="http://localhost:8081"
              />
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                For text processing and structuring
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">LLaVa Endpoint</label>
              <input
                type="text"
                className="form-input"
                value={config.llavaEndpoint}
                onChange={(e) => handleInputChange('llavaEndpoint', e.target.value)}
                placeholder="http://localhost:8082"
              />
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                For visual content analysis
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="setup-step">
            <div className="step-title">Obsidian Integration</div>
            <div className="step-description">
              Connect your Obsidian vault for seamless note-taking and organization.
            </div>

            <div className="form-group">
              <label className="form-label">Obsidian Vault Path</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={config.obsidianVaultPath}
                  onChange={(e) => handleInputChange('obsidianVaultPath', e.target.value)}
                  placeholder="/path/to/your/obsidian/vault"
                  style={{ flex: 1 }}
                />
                <button className="btn btn-secondary" onClick={selectVaultPath}>
                  Browse
                </button>
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                Select your existing Obsidian vault or create a new one
              </div>
            </div>

            <div style={{ 
              background: 'rgba(0, 122, 255, 0.1)', 
              border: '1px solid rgba(0, 122, 255, 0.3)',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '20px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                📝 Note Integration Features:
              </div>
              <ul style={{ fontSize: '12px', paddingLeft: '16px', lineHeight: '1.6' }}>
                <li>Automatic meeting note creation</li>
                <li>Real-time transcription appending</li>
                <li>Visual capture integration</li>
                <li>Structured note formatting</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="setup-wizard">
      <div className="setup-header">
        <h1>Meeting Pair AI Setup</h1>
        <p>Step {step} of 3</p>
      </div>

      {renderStep()}

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #333333'
      }}>
        <button 
          className="btn btn-secondary" 
          onClick={prevStep}
          disabled={step === 1}
          style={{ opacity: step === 1 ? 0.5 : 1 }}
        >
          Previous
        </button>

        {step < 3 ? (
          <button className="btn btn-primary" onClick={nextStep}>
            Next
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={completeSetup}
            disabled={isLoading}
          >
            {isLoading ? 'Setting up...' : 'Complete Setup'}
          </button>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '20px',
        gap: '8px'
      }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: i === step ? '#007AFF' : '#333333',
              transition: 'background 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
}