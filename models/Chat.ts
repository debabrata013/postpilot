// models/Chat.ts
import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema({
  role: { 
    type: String, 
    required: true,
    enum: ['user', 'assistant']
  },
  content: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const ChatSchema = new Schema({
  userId: { 
    type: String, 
    required: true,
    index: true // Add index for faster queries by userId
  },
  title: { 
    type: String, 
    required: true 
  },
  messages: [MessageSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt timestamp on save
ChatSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
