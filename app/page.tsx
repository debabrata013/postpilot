"use client";
import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Plus, Trash2, Edit, X, Loader2, LogOut } from 'lucide-react';
import { chatApi } from '@/lib/api';
import { useUser, useAuth, SignOutButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  _id?: string;
};

type Chat = {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { userId: clerkUserId } = useAuth();
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [loadingChats, setLoadingChats] = useState(false);
  const [userId, setUserId] = useState(clerkUserId || '');
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [currentChatTitle, setCurrentChatTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect('/sign-in');
    }
  }, [isLoaded, isSignedIn]);

  // Update userId when clerk auth loads
  useEffect(() => {
    if (clerkUserId) {
      setUserId(clerkUserId);
    }
  }, [clerkUserId]);

  // Fetch chat history on component mount and when userId changes
  useEffect(() => {
    if (userId) {
      fetchChats();
    }
  }, [userId]);

  // Focus title input when editing
  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [editingTitle]);

  const fetchChats = async () => {
    if (!userId) return;
    
    setLoadingChats(true);
    setError(null);
    try {
      const data = await chatApi.listChats(userId);
      setChats(data.chats);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load chats. Please try again.');
    } finally {
      setLoadingChats(false);
    }
  };

  const loadChat = async (chatId: string) => {
    setLoading(true);
    setError(null);
    try {
      const chat = await chatApi.getChat(chatId);
      setMessages(chat.messages);
      setCurrentChatId(chatId);
      setCurrentChatTitle(chat.title);
      setNewTitle(chat.title);
    } catch (err) {
      console.error('Error loading chat:', err);
      setError('Failed to load chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setError(null);
    try {
      await chatApi.deleteChat(chatId);
      setChats(chats.filter(chat => chat._id !== chatId));
      if (currentChatId === chatId) {
        setMessages([]);
        setCurrentChatId(null);
        setCurrentChatTitle('');
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError('Failed to delete chat. Please try again.');
    }
  };

  const updateChatTitle = async () => {
    if (!currentChatId || !newTitle.trim()) return;
    
    setError(null);
    try {
      await chatApi.updateChatTitle(currentChatId, newTitle);
      
      setCurrentChatTitle(newTitle);
      setEditingTitle(false);
      
      // Update the title in the chats list
      setChats(chats.map(chat => 
        chat._id === currentChatId ? { ...chat, title: newTitle } : chat
      ));
    } catch (err) {
      console.error('Error updating chat title:', err);
      setError('Failed to update chat title. Please try again.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !userId) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    
    // Optimistically update UI
    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      let response;
      
      if (currentChatId) {
        // Update existing chat
        response = await chatApi.updateChat(currentChatId, input);
        setMessages(response.messages);
      } else {
        // Create new chat
        response = await chatApi.createChat(userId, input);
        setCurrentChatId(response._id);
        setCurrentChatTitle(response.title);
        setNewTitle(response.title);
        setMessages(response.messages);
        
        // Refresh chat list
        fetchChats();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateChatTitle();
    } else if (e.key === 'Escape') {
      setEditingTitle(false);
      setNewTitle(currentChatTitle);
    }
  };

  const newChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setCurrentChatTitle('');
    setInput('');
    setError(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state while Clerk loads
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 size={48} className="animate-spin text-blue-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-white text-xl font-medium">Loading</p>
            <p className="text-gray-400 text-sm">Please wait while we set things up...</p>
          </div>
        </div>
      </div>
    );
  }       

  return (
    <div className="flex bg-gray-50 h-screen">  
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col border-r border-white-800">
        <div className="p-4">
          <button 
            onClick={newChat}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />
            <span>New chat</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs text-gray-400 mb-2">Recent chats</div>
          {loadingChats ? (
            <div className="text-center py-4 text-gray-500">
              <Loader2 size={20} className="animate-spin mx-auto mb-2" />
              Loading chats...
            </div>
          ) : chats.length > 0 ? (
            <div className="space-y-1">
              {chats.map(chat => (
                <div 
                  key={chat._id}
                  onClick={() => loadChat(chat._id)}
                  className={`p-2 rounded flex justify-between items-center cursor-pointer text-sm hover:bg-gray-800 group ${
                    currentChatId === chat._id ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="truncate flex-1">{chat.title}</div>
                  <button 
                    onClick={(e) => deleteChat(chat._id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No chats yet</div>
          )}
        </div>

        {/* User profile section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {user?.imageUrl && (
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <div className="text-sm truncate">
                {user?.fullName || user?.username || 'User'}
              </div>
            </div>
            <SignOutButton>
              <button className="p-1 rounded hover:bg-gray-800">
                <LogOut size={16} />
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        {currentChatId && (
          <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
            {editingTitle ? (
              <div className="flex-1 flex items-center">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  onBlur={updateChatTitle}
                  className="bg-gray-700 text-white px-2 py-1 rounded flex-1 mr-2"
                  placeholder="Chat title"
                />
                <button 
                  onClick={updateChatTitle}
                  className="text-gray-400 hover:text-white"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => {
                    setEditingTitle(false);
                    setNewTitle(currentChatTitle);
                  }}
                  className="text-gray-400 hover:text-white ml-2"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <h2 className="text-white font-medium truncate">{currentChatTitle}</h2>
                <button 
                  onClick={() => setEditingTitle(true)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  <Edit size={16} />
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border-b border-red-700 p-2 text-center">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-900">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <Bot size={32} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-white">How can I help you today?</h2>
              <p className="text-gray-400 mb-8">I'm PostPilot, your AI content creation assistant. Ask me about social media posts, content ideas, or marketing strategies!</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                <button 
                  onClick={() => setInput("Create an engaging Instagram post about productivity tips")}
                  className="p-4 border border-gray-700 rounded-lg hover:bg-gray-800 text-left transition-colors"
                >
                  <div className="font-medium mb-1 text-white">📱 Instagram Content</div>
                  <div className="text-sm text-gray-400">Create engaging posts for Instagram</div>
                </button>
                <button 
                  onClick={() => setInput("Help me plan a content calendar for this week")}
                  className="p-4 border border-gray-700 rounded-lg hover:bg-gray-800 text-left transition-colors"
                >
                  <div className="font-medium mb-1 text-white">📅 Content Planning</div>
                  <div className="text-sm text-gray-400">Plan your content strategy</div>
                </button>
                <button 
                  onClick={() => setInput("What are some trending hashtags for small businesses?")}
                  className="p-4 border border-gray-700 rounded-lg hover:bg-gray-800 text-left transition-colors"
                >
                  <div className="font-medium mb-1 text-white"># Hashtag Research</div>
                  <div className="text-sm text-gray-400">Find trending hashtags</div>
                </button>
                <button 
                  onClick={() => setInput("Write a LinkedIn post about remote work benefits")}
                  className="p-4 border border-gray-700 rounded-lg hover:bg-gray-800 text-left transition-colors"
                >
                  <div className="font-medium mb-1 text-white">💼 LinkedIn Content</div>
                  <div className="text-sm text-gray-400">Professional content creation</div>
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full">
              {messages.map((msg, i) => (
                <div key={i} className={`py-6 px-4 ${msg.role === 'assistant' ? 'bg-gray-800' : 'bg-gray-900'}`}>
                  <div className="max-w-3xl mx-auto flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-green-600 text-white'
                    }`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap break-words text-gray-300">{msg.content}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="py-6 px-4 bg-gray-800">
                  <div className="max-w-3xl mx-auto flex gap-4">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-end gap-3 bg-gray-900 border border-gray-700 rounded-lg shadow-sm">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Message PostPilot..."
                className="flex-1 resize-none border-none outline-none p-4 rounded-lg max-h-[200px] min-h-[24px] bg-gray-900 text-gray-300 placeholder-gray-500"
                rows={1}
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className={`p-2 m-2 rounded-lg transition-colors ${
                  input.trim() && !loading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
            <div className="text-xs text-gray-500 text-center mt-2">
              PostPilot can make mistakes. Consider checking important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
