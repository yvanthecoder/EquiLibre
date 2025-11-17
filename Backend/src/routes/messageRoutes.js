const express = require('express');
const router = express.Router();
const {
  getUserConversations,
  getConversationInfo,
  getConversationMessages,
  createConversation,
  sendMessage,
  markConversationAsRead,
  getUnreadCount,
  deleteMessage,
  getAllUsers
} = require('../controllers/messageController');
const { authenticate } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticate);

// Get all users (for creating new conversations)
router.get('/users', getAllUsers);

// Conversation routes
router.get('/conversations', getUserConversations);
router.get('/conversations/:id', getConversationInfo);
router.get('/conversations/:id/messages', getConversationMessages);
router.post('/conversations', createConversation);
router.patch('/conversations/:id/read', markConversationAsRead);

// Message routes
router.post('/messages', sendMessage);
router.delete('/messages/:id', deleteMessage);

// Unread count
router.get('/unread-count', getUnreadCount);

module.exports = router;
