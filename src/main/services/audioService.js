const { EventEmitter } = require('events');
const recorder = require('node-record-lpcm16');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

class AudioService extends EventEmitter {
  constructor() {
    super();
    this.recording = null;
    this.audioBuffer = [];
    this.isRecording = false;
    this.transcriptionInterval = null;
  }

  async startRecording() {
    if (this.isRecording) return;

    this.isRecording = true;
    this.audioBuffer = [];

    this.recording = recorder.record({
      sampleRateHertz: 16000,
      threshold: 0,
      verbose: false,
      recordProgram: 'rec', // Use SoX for macOS
      silence: '1.0',
      device: null
    });

    this.recording.stream()
      .on('data', (chunk) => {
        this.audioBuffer.push(chunk);
      })
      .on('error', (err) => {
        console.error('Recording error:', err);
        this.emit('error', err);
      });

    // Process audio chunks every 5 seconds
    this.transcriptionInterval = setInterval(() => {
      this.processAudioBuffer();
    }, 5000);

    console.log('Audio recording started');
  }

  async stopRecording() {
    if (!this.isRecording) return;

    this.isRecording = false;

    if (this.recording) {
      this.recording.stop();
      this.recording = null;
    }

    if (this.transcriptionInterval) {
      clearInterval(this.transcriptionInterval);
      this.transcriptionInterval = null;
    }

    // Process any remaining audio
    if (this.audioBuffer.length > 0) {
      await this.processAudioBuffer();
    }

    console.log('Audio recording stopped');
  }

  async processAudioBuffer() {
    if (this.audioBuffer.length === 0) return;

    try {
      // Combine audio chunks
      const audioData = Buffer.concat(this.audioBuffer);
      this.audioBuffer = [];

      // Save temporary audio file
      const tempPath = path.join(__dirname, '../temp', `audio_${Date.now()}.wav`);
      await this.saveWavFile(audioData, tempPath);

      // Transcribe with Whisper
      const transcription = await this.transcribeAudio(tempPath);

      if (transcription && transcription.trim()) {
        this.emit('transcription', transcription);
      }

      // Clean up temp file
      fs.unlinkSync(tempPath);
    } catch (error) {
      console.error('Audio processing error:', error);
    }
  }

  async saveWavFile(audioData, filePath) {
    return new Promise((resolve, reject) => {
      // Ensure temp directory exists
      const tempDir = path.dirname(filePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Create WAV header
      const wavHeader = this.createWavHeader(audioData.length);
      const wavFile = Buffer.concat([wavHeader, audioData]);

      fs.writeFile(filePath, wavFile, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  createWavHeader(dataLength) {
    const header = Buffer.alloc(44);
    
    // RIFF header
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataLength, 4);
    header.write('WAVE', 8);
    
    // fmt chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // chunk size
    header.writeUInt16LE(1, 20); // audio format (PCM)
    header.writeUInt16LE(1, 22); // num channels
    header.writeUInt32LE(16000, 24); // sample rate
    header.writeUInt32LE(32000, 28); // byte rate
    header.writeUInt16LE(2, 32); // block align
    header.writeUInt16LE(16, 34); // bits per sample
    
    // data chunk
    header.write('data', 36);
    header.writeUInt32LE(dataLength, 40);
    
    return header;
  }

  async transcribeAudio(audioPath) {
    try {
      // This would integrate with Whisper.cpp
      // For now, we'll use a placeholder that would connect to your Whisper service
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(audioPath));
      formData.append('model', 'whisper-1');

      // Replace with your actual Whisper.cpp endpoint
      const response = await axios.post('http://localhost:8080/transcribe', formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000
      });

      return response.data.text || '';
    } catch (error) {
      console.error('Transcription error:', error);
      return '';
    }
  }

  cleanup() {
    if (this.isRecording) {
      this.stopRecording();
    }
  }
}

module.exports = { AudioService };