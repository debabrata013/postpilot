import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Chat from '@/models/Chat';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    // Get chat history for a user with pagination
    if (req.method === 'GET') {
      const { userId, page = '1', limit = '10' } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      
      try {
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;
        
        const chats = await Chat.find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum);
          
        const total = await Chat.countDocuments({ userId });
        
        return res.status(200).json({
          chats,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum)
          }
        });
      } catch (error) {
        console.error('Error fetching chat history:', error);
        return res.status(500).json({ error: 'Failed to fetch chat history' });
      }
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
