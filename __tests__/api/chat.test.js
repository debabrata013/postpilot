import { createMocks } from 'node-mocks-http';
import { POST, PUT } from '@/app/api/chat/route';
import Chat from '@/models/Chat';

// Mock the Chat model
jest.mock('@/models/Chat', () => ({
  create: jest.fn(),
  findById: jest.fn(),
}));

// Mock the generateSocialContent function
jest.mock('@/lib/gemini', () => ({
  generateSocialContent: jest.fn().mockResolvedValue('AI generated response'),
}));

// Mock the MongoDB connection
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));

describe('Chat API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/chat', () => {
    it('should create a new chat', async () => {
      // Mock the request and response
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          userId: 'test-user-123',
          message: 'Hello, world!',
        },
      });

      // Mock the Chat.create method
      Chat.create.mockResolvedValueOnce({
        _id: 'mock-chat-id',
        userId: 'test-user-123',
        title: 'Hello, world!',
        messages: [
          { role: 'user', content: 'Hello, world!', timestamp: new Date() },
          { role: 'assistant', content: 'AI generated response', timestamp: new Date() },
        ],
      });

      // Call the API handler
      const response = await POST(req);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data._id).toBe('mock-chat-id');
      expect(data.userId).toBe('test-user-123');
      expect(data.messages).toHaveLength(2);
      expect(data.messages[0].role).toBe('user');
      expect(data.messages[1].role).toBe('assistant');
    });

    it('should return 400 if userId or message is missing', async () => {
      // Mock the request and response without userId
      const { req: reqNoUserId, res: resNoUserId } = createMocks({
        method: 'POST',
        body: {
          message: 'Hello, world!',
        },
      });

      // Call the API handler
      const responseNoUserId = await POST(reqNoUserId);
      
      // Assertions
      expect(responseNoUserId.status).toBe(400);
      
      // Mock the request and response without message
      const { req: reqNoMessage, res: resNoMessage } = createMocks({
        method: 'POST',
        body: {
          userId: 'test-user-123',
        },
      });

      // Call the API handler
      const responseNoMessage = await POST(reqNoMessage);
      
      // Assertions
      expect(responseNoMessage.status).toBe(400);
    });
  });

  describe('PUT /api/chat', () => {
    it('should update an existing chat', async () => {
      // Mock the request and response
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          chatId: 'mock-chat-id',
          message: 'Hello again!',
        },
      });

      // Mock the Chat.findById method
      Chat.findById.mockResolvedValueOnce({
        _id: 'mock-chat-id',
        userId: 'test-user-123',
        title: 'Hello, world!',
        messages: [
          { role: 'user', content: 'Hello, world!', timestamp: new Date() },
          { role: 'assistant', content: 'AI generated response', timestamp: new Date() },
        ],
        save: jest.fn().mockResolvedValueOnce({
          _id: 'mock-chat-id',
          userId: 'test-user-123',
          title: 'Hello, world!',
          messages: [
            { role: 'user', content: 'Hello, world!', timestamp: new Date() },
            { role: 'assistant', content: 'AI generated response', timestamp: new Date() },
            { role: 'user', content: 'Hello again!', timestamp: new Date() },
            { role: 'assistant', content: 'AI generated response', timestamp: new Date() },
          ],
        }),
      });

      // Call the API handler
      const response = await PUT(req);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data._id).toBe('mock-chat-id');
      expect(data.messages).toHaveLength(4);
      expect(data.messages[2].role).toBe('user');
      expect(data.messages[2].content).toBe('Hello again!');
      expect(data.messages[3].role).toBe('assistant');
    });

    it('should return 400 if chatId or message is missing', async () => {
      // Mock the request and response without chatId
      const { req: reqNoChatId, res: resNoChatId } = createMocks({
        method: 'PUT',
        body: {
          message: 'Hello again!',
        },
      });

      // Call the API handler
      const responseNoChatId = await PUT(reqNoChatId);
      
      // Assertions
      expect(responseNoChatId.status).toBe(400);
      
      // Mock the request and response without message
      const { req: reqNoMessage, res: resNoMessage } = createMocks({
        method: 'PUT',
        body: {
          chatId: 'mock-chat-id',
        },
      });

      // Call the API handler
      const responseNoMessage = await PUT(reqNoMessage);
      
      // Assertions
      expect(responseNoMessage.status).toBe(400);
    });

    it('should return 404 if chat is not found', async () => {
      // Mock the request and response
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          chatId: 'non-existent-chat-id',
          message: 'Hello again!',
        },
      });

      // Mock the Chat.findById method to return null
      Chat.findById.mockResolvedValueOnce(null);

      // Call the API handler
      const response = await PUT(req);
      
      // Assertions
      expect(response.status).toBe(404);
    });
  });
});
