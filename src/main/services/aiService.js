const axios = require('axios');
const FormData = require('form-data');

class AIService {
  constructor() {
    this.config = null;
    this.tinyLlamaEndpoint = null;
    this.llavaEndpoint = null;
  }

  initialize() {
    // Initialize AI service connections
    console.log('AI Service initialized');
  }

  async updateConfig(config) {
    this.config = config;
    this.tinyLlamaEndpoint = config.tinyLlamaEndpoint || 'http://localhost:8081';
    this.llavaEndpoint = config.llavaEndpoint || 'http://localhost:8082';
  }

  async processText(text) {
    if (!text || !this.config) return text;

    try {
      const prompt = `Please structure and format the following meeting transcription into clear, organized notes with proper headings and bullet points:\n\n${text}`;
      
      const response = await axios.post(`${this.tinyLlamaEndpoint}/generate`, {
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.3,
        stop: ['\n\n\n']
      }, {
        timeout: 10000
      });

      return response.data.text || text;
    } catch (error) {
      console.error('Text processing error:', error);
      return text; // Return original text if processing fails
    }
  }

  async processImage(imageData) {
    if (!imageData || !this.config) {
      throw new Error('No image data or configuration available');
    }

    try {
      // Convert base64 to buffer
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      const formData = new FormData();
      formData.append('image', imageBuffer, 'capture.png');
      formData.append('prompt', 'Describe this image in detail and extract any text content.');

      const response = await axios.post(`${this.llavaEndpoint}/analyze`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000
      });

      return {
        description: response.data.description || '',
        extractedText: response.data.text || '',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw error;
    }
  }

  async generateSummary(notes) {
    if (!notes || !this.config) return notes;

    try {
      const prompt = `Please create a concise summary of the following meeting notes:\n\n${notes}`;
      
      const response = await axios.post(`${this.tinyLlamaEndpoint}/generate`, {
        prompt: prompt,
        max_tokens: 300,
        temperature: 0.2
      }, {
        timeout: 10000
      });

      return response.data.text || notes;
    } catch (error) {
      console.error('Summary generation error:', error);
      return notes;
    }
  }
}

module.exports = { AIService };