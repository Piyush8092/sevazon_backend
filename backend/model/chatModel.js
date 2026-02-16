const mongoose = require('mongoose');
const { Schema } = mongoose;

// ChatRoom (Conversation) Schema
const ChatRoomSchema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isGroup: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'ChatMessage',
    default: null
  }
});

ChatRoomSchema.index({ participants: 1 });

// ChatMessage Schema
const ChatMessageSchema = new Schema({
  room: {
    type: Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ChatMessageSchema.index({ room: 1, createdAt: -1 });

const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema);
const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

module.exports = {
  ChatRoom,
  ChatMessage
};
