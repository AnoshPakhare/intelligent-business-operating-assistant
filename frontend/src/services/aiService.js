import api from './api';

/**
 * AI Agent Service: Interfaces frontend AI components
 * with local Ollama-backed FastAPI endpoint POST /ai/chat.
 */
export const aiService = {
  /**
   * Sends a user chat message (EN, HI, or Hinglish) to the AI Agent.
   * Endpoint: POST /ai/chat
   * Payload: { message }
   */
  async sendChatMessage(message) {
    return await api.post('/ai/chat', { message });
  },
};

export default aiService;
