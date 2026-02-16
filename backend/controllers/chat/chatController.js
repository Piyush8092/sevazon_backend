const { ChatRoom, ChatMessage } = require('../../model/chatModel');
const User = require('../../model/userModel');

// Create or get a chat room (1-1 or group)
exports.createOrGetRoom = async (req, res) => {
  try {
    const { participantIds, isGroup, name } = req.body;
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
      return res.status(400).json({ message: 'At least 2 participants required', success: false, error: true });
    }
    // For 1-1 chat, check if room exists
    let room;
    if (!isGroup) {
      room = await ChatRoom.findOne({
        participants: { $all: participantIds, $size: 2 },
        isGroup: false
      });
    }
    if (!room) {
      room = await ChatRoom.create({
        participants: participantIds,
        isGroup: !!isGroup,
        name: isGroup ? name : ''
      });
    }
    return res.json({ message: 'Room ready', data: room, success: true, error: false });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to create/get room', data: e.message, success: false, error: true });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { roomId, content, type } = req.body;
    const sender = req.user._id;
    if (!roomId || !content) {
      return res.status(400).json({ message: 'roomId and content required', success: false, error: true });
    }
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found', success: false, error: true });
    }
    if (!room.participants.map(id => id.toString()).includes(sender.toString())) {
      return res.status(403).json({ message: 'Not a participant', success: false, error: true });
    }
    const message = await ChatMessage.create({
      room: roomId,
      sender,
      content,
      type: type || 'text'
    });
    room.lastMessage = message._id;
    room.updatedAt = new Date();
    await room.save();
    return res.json({ message: 'Message sent', data: message, success: true, error: false });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to send message', data: e.message, success: false, error: true });
  }
};

// Get messages for a room (paginated)
exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 30, before } = req.query;
    const sender = req.user._id;
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found', success: false, error: true });
    }
    if (!room.participants.map(id => id.toString()).includes(sender.toString())) {
      return res.status(403).json({ message: 'Not a participant', success: false, error: true });
    }
    const query = { room: roomId };
    if (before) query._id = { $lt: before };
    const messages = await ChatMessage.find(query)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .populate('sender', 'name _id');
    return res.json({ message: 'Messages fetched', data: messages.reverse(), success: true, error: false });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch messages', data: e.message, success: false, error: true });
  }
};

// Get all rooms for a user
exports.getRooms = async (req, res) => {
  try {
    const userId = req.user._id;
    const rooms = await ChatRoom.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name _id')
      .populate('lastMessage');
    return res.json({ message: 'Rooms fetched', data: rooms, success: true, error: false });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch rooms', data: e.message, success: false, error: true });
  }
};
