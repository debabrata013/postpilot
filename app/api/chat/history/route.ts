import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/models/Chat';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: 'Page and limit must be positive integers' },
        { status: 400 }
      );
    }
    
    try {
      const skip = (page - 1) * limit;
      
      // Use projection to include all fields but limit message content length for performance
      const chats = await Chat.find({ userId })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
        
      const total = await Chat.countDocuments({ userId });
      
      return NextResponse.json({
        chats,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chat history' },
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
