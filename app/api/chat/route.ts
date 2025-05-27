import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/models/Chat';
import { generateSocialContent } from '@/lib/gemini';
import { generateChatTitle } from '@/lib/utils';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { userId, message, title } = body;

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'userId and message are required' },
        { status: 400 }
      );
    }

    try {
      const aiResponse = await generateSocialContent(message);
      
      const chatTitle = title || message.substring(0, 30) + (message.length > 30 ? '...' : '');
      
      const newChat = await Chat.create({
        userId,
        title: chatTitle,
        messages: [
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'assistant', content: aiResponse, timestamp: new Date() }
        ]
      });

      return NextResponse.json(newChat);
    } catch (error) {
      console.error('Error creating chat:', error);
      return NextResponse.json(
        { error: 'Failed to create chat' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { chatId, message } = body;
    
    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'chatId and message are required' },
        { status: 400 }
      );
    }
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json(
        { error: 'Invalid chat ID format' },
        { status: 400 }
      );
    }
    
    try {
      // Find the chat first to check if it exists
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return NextResponse.json(
          { error: 'Chat not found' },
          { status: 404 }
        );
      }
      
      // Generate AI response
      const aiResponse = await generateSocialContent(message);
      
      // Update the chat with new messages and update timestamp
      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
          $push: {
            messages: [
              { role: 'user', content: message, timestamp: new Date() },
              { role: 'assistant', content: aiResponse, timestamp: new Date() }
            ]
          },
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );
      
      return NextResponse.json(updatedChat);
    } catch (error) {
      console.error('Error updating chat:', error);
      return NextResponse.json(
        { error: 'Failed to update chat' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
