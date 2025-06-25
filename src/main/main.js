const { app, BrowserWindow, Tray, Menu, ipcMain, screen, desktopCapturer, systemPreferences } = require('electron');
const path = require('path');
const Store = require('electron-store');
const CryptoJS = require('crypto-js');
const { AudioService } = require('./services/audioService');
const { ObsidianService } = require('./services/obsidianService');
const { AIService } = require('./services/aiService');

class MeetingPairApp {
  constructor() {
    this.store = new Store();
    this.tray = null;
    this.mainWindow = null;
    this.setupWindow = null;
    this.captureWindow = null;
    this.audioService = new AudioService();
    this.obsidianService = new ObsidianService();
    this.aiService = new AIService();
    this.isRecording = false;
    this.isDarkMode = this.store.get('darkMode', true);
  }

  async initialize() {
    await app.whenReady();
    
    // Request microphone permissions
    await this.requestPermissions();
    
    // Check if first time setup is needed
    if (!this.store.get('setupComplete')) {
      this.createSetupWindow();
    } else {
      this.createTray();
      this.startBackgroundServices();
    }

    this.setupIPC();
  }

  async requestPermissions() {
    try {
      const microphoneAccess = await systemPreferences.askForMediaAccess('microphone');
      const screenAccess = await systemPreferences.getMediaAccessStatus('screen');
      
      if (!microphoneAccess) {
        console.warn('Microphone access denied');
      }
      
      if (screenAccess !== 'granted') {
        console.warn('Screen recording access may be required');
      }
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  }

  createTray() {
    const iconPath = path.join(__dirname, '../assets/tray-icon.png');
    this.tray = new Tray(iconPath);
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Meeting Pair AI',
        type: 'normal',
        enabled: false
      },
      { type: 'separator' },
      {
        label: this.isRecording ? 'Stop Recording' : 'Start Recording',
        click: () => this.toggleRecording()
      },
      {
        label: 'Visual Capture',
        click: () => this.openVisualCapture()
      },
      {
        label: 'Open Notes',
        click: () => this.openObsidian()
      },
      { type: 'separator' },
      {
        label: 'Settings',
        click: () => this.openSettings()
      },
      {
        label: 'Dark Mode',
        type: 'checkbox',
        checked: this.isDarkMode,
        click: () => this.toggleDarkMode()
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => app.quit()
      }
    ]);

    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip('Meeting Pair AI');
    
    // Update tray icon based on recording status
    this.updateTrayIcon();
  }

  updateTrayIcon() {
    const iconName = this.isRecording ? 'tray-icon-recording.png' : 'tray-icon.png';
    const iconPath = path.join(__dirname, '../assets', iconName);
    if (this.tray) {
      this.tray.setImage(iconPath);
    }
  }

  createSetupWindow() {
    this.setupWindow = new BrowserWindow({
      width: 600,
      height: 700,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      titleBarStyle: 'hiddenInset',
      backgroundColor: '#000000'
    });

    const setupPath = app.isPackaged 
      ? path.join(__dirname, '../dist-renderer/setup.html')
      : 'http://localhost:3000/setup.html';
    
    this.setupWindow.loadURL(setupPath);
    
    this.setupWindow.on('closed', () => {
      this.setupWindow = null;
    });
  }

  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 400,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      titleBarStyle: 'hiddenInset',
      backgroundColor: this.isDarkMode ? '#000000' : '#ffffff',
      show: false
    });

    const mainPath = app.isPackaged 
      ? path.join(__dirname, '../dist-renderer/index.html')
      : 'http://localhost:3000';
    
    this.mainWindow.loadURL(mainPath);
    
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  openVisualCapture() {
    if (this.captureWindow) {
      this.captureWindow.focus();
      return;
    }

    this.captureWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      titleBarStyle: 'hiddenInset',
      backgroundColor: '#1A1A1A'
    });

    const capturePath = app.isPackaged 
      ? path.join(__dirname, '../dist-renderer/capture.html')
      : 'http://localhost:3000/capture.html';
    
    this.captureWindow.loadURL(capturePath);
    
    this.captureWindow.on('closed', () => {
      this.captureWindow = null;
    });
  }

  async toggleRecording() {
    if (this.isRecording) {
      await this.stopRecording();
    } else {
      await this.startRecording();
    }
    
    this.isRecording = !this.isRecording;
    this.updateTrayIcon();
    this.createTray(); // Refresh tray menu
  }

  async startRecording() {
    try {
      await this.audioService.startRecording();
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }

  async stopRecording() {
    try {
      await this.audioService.stopRecording();
      console.log('Recording stopped');
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }

  openObsidian() {
    this.obsidianService.openVault();
  }

  openSettings() {
    if (!this.mainWindow) {
      this.createMainWindow();
    }
    this.mainWindow.show();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.store.set('darkMode', this.isDarkMode);
    
    // Update all windows
    if (this.mainWindow) {
      this.mainWindow.webContents.send('theme-changed', this.isDarkMode);
    }
    
    this.createTray(); // Refresh tray menu
  }

  startBackgroundServices() {
    // Initialize AI services
    this.aiService.initialize();
    
    // Setup audio transcription pipeline
    this.audioService.on('transcription', (text) => {
      this.handleTranscription(text);
    });
  }

  async handleTranscription(text) {
    try {
      // Process text with TinyLLama
      const structuredText = await this.aiService.processText(text);
      
      // Send to Obsidian
      await this.obsidianService.appendToNote(structuredText);
      
      // Notify UI if open
      if (this.mainWindow) {
        this.mainWindow.webContents.send('transcription-update', structuredText);
      }
    } catch (error) {
      console.error('Failed to handle transcription:', error);
    }
  }

  setupIPC() {
    ipcMain.handle('complete-setup', async (event, config) => {
      try {
        // Encrypt and store API keys
        const encryptedConfig = this.encryptConfig(config);
        this.store.set('apiConfig', encryptedConfig);
        this.store.set('setupComplete', true);
        
        // Initialize services with new config
        await this.aiService.updateConfig(config);
        await this.obsidianService.updateConfig(config);
        
        // Close setup window and create tray
        if (this.setupWindow) {
          this.setupWindow.close();
        }
        
        this.createTray();
        this.startBackgroundServices();
        
        return { success: true };
      } catch (error) {
        console.error('Setup failed:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('get-sources', async () => {
      const sources = await desktopCapturer.getSources({
        types: ['window', 'screen']
      });
      return sources;
    });

    ipcMain.handle('capture-screenshot', async () => {
      try {
        const sources = await desktopCapturer.getSources({
          types: ['screen'],
          thumbnailSize: { width: 1920, height: 1080 }
        });
        
        if (sources.length > 0) {
          return sources[0].thumbnail.toDataURL();
        }
        
        throw new Error('No screen sources available');
      } catch (error) {
        console.error('Screenshot capture failed:', error);
        throw error;
      }
    });

    ipcMain.handle('process-image', async (event, imageData) => {
      try {
        const result = await this.aiService.processImage(imageData);
        return result;
      } catch (error) {
        console.error('Image processing failed:', error);
        throw error;
      }
    });

    ipcMain.handle('get-config', () => {
      const encryptedConfig = this.store.get('apiConfig');
      if (encryptedConfig) {
        return this.decryptConfig(encryptedConfig);
      }
      return null;
    });
  }

  encryptConfig(config) {
    const secretKey = 'meeting-pair-ai-secret-key';
    return CryptoJS.AES.encrypt(JSON.stringify(config), secretKey).toString();
  }

  decryptConfig(encryptedConfig) {
    const secretKey = 'meeting-pair-ai-secret-key';
    const bytes = CryptoJS.AES.decrypt(encryptedConfig, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
}

// Initialize app
const meetingApp = new MeetingPairApp();
meetingApp.initialize();

// App event handlers
app.on('window-all-closed', (event) => {
  event.preventDefault(); // Keep app running in background
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    meetingApp.openSettings();
  }
});

app.on('before-quit', () => {
  if (meetingApp.audioService) {
    meetingApp.audioService.cleanup();
  }
});