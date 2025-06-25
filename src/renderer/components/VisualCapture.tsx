import React, { useState, useRef } from 'react';

const { ipcRenderer } = window.require('electron');

export default function VisualCapture() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const captureScreenshot = async () => {
    try {
      setIsProcessing(true);
      const imageData = await ipcRenderer.invoke('capture-screenshot');
      setCapturedImage(imageData);
    } catch (error) {
      console.error('Screenshot capture failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!capturedImage) return;

    try {
      setIsProcessing(true);
      const result = await ipcRenderer.invoke('process-image', capturedImage);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Image processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveToNotes = async () => {
    if (!analysisResult) return;

    try {
      // This would save the analysis to the current meeting note
      console.log('Saving to notes:', analysisResult);
    } catch (error) {
      console.error('Failed to save to notes:', error);
    }
  };

  const clearCapture = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
  };

  return (
    <div className="visual-capture">
      <div className="capture-header">
        <h2>Visual Capture</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={clearCapture}>
            Clear
          </button>
          <button className="btn btn-secondary" onClick={() => window.close()}>
            Close
          </button>
        </div>
      </div>

      <div className="capture-content">
        {capturedImage ? (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <img 
              src={capturedImage} 
              alt="Captured content" 
              className="capture-preview"
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>
              No image captured
            </div>
            <div style={{ fontSize: '14px' }}>
              Use the buttons below to capture or upload an image
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="processing-overlay">
            <div style={{ textAlign: 'center' }}>
              <div className="spinner"></div>
              <div style={{ marginTop: '16px', fontSize: '14px' }}>
                Processing image...
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="capture-controls">
        <button 
          className="btn btn-primary" 
          onClick={captureScreenshot}
          disabled={isProcessing}
        >
          📸 Screenshot
        </button>
        
        <button 
          className="btn btn-secondary" 
          onClick={uploadImage}
          disabled={isProcessing}
        >
          📁 Upload Image
        </button>

        {capturedImage && (
          <button 
            className="btn btn-primary" 
            onClick={processImage}
            disabled={isProcessing}
          >
            🤖 Analyze
          </button>
        )}

        {analysisResult && (
          <button 
            className="btn btn-primary" 
            onClick={saveToNotes}
          >
            💾 Save to Notes
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {analysisResult && (
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginBottom: '12px' }}>Analysis Result</h3>
          
          {analysisResult.description && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Description:</h4>
              <p style={{ fontSize: '13px', lineHeight: '1.5' }}>
                {analysisResult.description}
              </p>
            </div>
          )}

          {analysisResult.extractedText && (
            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Extracted Text:</h4>
              <div style={{ 
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '12px',
                borderRadius: '4px',
                fontFamily: 'SF Mono, Monaco, monospace',
                fontSize: '12px',
                lineHeight: '1.4'
              }}>
                {analysisResult.extractedText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}