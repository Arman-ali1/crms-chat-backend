// src/module/chat.model.js
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    targetUserId: {
      type: String,
      // Optional field; remove 'required' or leave as is since it defaults to optional
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
