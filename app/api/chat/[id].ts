import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Chat from '@/models/Chat';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  try {
    await dbConnect();

    // Get a specific chat by ID
    if (req.method === 'GET') {
      try {
        const chat = await Chat.findById(id);
        if (!chat) {
          return res.status(404).json({ error: 'Chat not found' });
        }
        return res.status(200).json(chat);
      } catch (error) {
        console.error('Error fetching chat:', error);
        return res.status(500).json({ error: 'Failed to fetch chat' });
      }
    }

    // Update chat title
    if (req.method === 'PATCH') {
      const { title } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'title is required' });
      }
      
      try {
        const chat = await Chat.findById(id);
        if (!chat) {
          return res.status(404).json({ error: 'Chat not found' });
        }
        
        chat.title = title;
        await chat.save();
        
        return res.status(200).json(chat);
      } catch (error) {
        console.error('Error updating chat title:', error);
        return res.status(500).json({ error: 'Failed to update chat title' });
      }
    }

    // Delete a specific chat
    if (req.method === 'DELETE') {
      try {
        const result = await Chat.findByIdAndDelete(id);
        if (!result) {
          return res.status(404).json({ error: 'Chat not found' });
        }
        return res.status(200).json({ message: 'Chat deleted successfully' });
      } catch (error) {
        console.error('Error deleting chat:', error);
        return res.status(500).json({ error: 'Failed to delete chat' });
      }
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
