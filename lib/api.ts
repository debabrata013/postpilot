// API client for PostPilot
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Chat API functions
export const chatApi = {
  // Create a new chat
  createChat: async (userId: string, message: string) => {
    try {
      const response = await api.post('/chat', { userId, message });
      return response.data;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  // Get a chat by ID
  getChat: async (chatId: string) => {
    try {
      const response = await api.get(`/chat/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat:', error);
      throw error;
    }
  },

  // Update an existing chat with a new message
  updateChat: async (chatId: string, message: string) => {
    try {
      const response = await api.put('/chat', { chatId, message });
      return response.data;
    } catch (error) {
      console.error('Error updating chat:', error);
      throw error;
    }
  },

  // Update a chat's title
  updateChatTitle: async (chatId: string, title: string) => {
    try {
      const response = await api.patch(`/chat/${chatId}`, { title });
      return response.data;
    } catch (error) {
      console.error('Error updating chat title:', error);
      throw error;
    }
  },

  // Delete a chat
  deleteChat: async (chatId: string) => {
    try {
      const response = await api.delete(`/chat/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  },

  // List all chats for a user
  listChats: async (userId: string, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/chats?userId=${userId}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error listing chats:', error);
      throw error;
    }
  },

  // Get chat history with pagination
  getChatHistory: async (userId: string, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/chat/history?userId=${userId}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  },
};

export default api;
