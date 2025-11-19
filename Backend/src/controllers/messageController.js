const Message = require('../models/Message');
const pool = require('../config/database');

/**
 * Get all conversations for the authenticated user
 */
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const conversations = await Message.getUserConversations(userId);

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations'
    });
  }
};

/**
 * Get a specific conversation info
 */
const getConversationInfo = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const conversationId = parseInt(req.params.id, 10);

    const conversation = await Message.getConversationInfo(conversationId, userId);

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error in getConversationInfo:', error);
    if (error.message === 'User is not a participant in this conversation') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas participant de cette conversation'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la conversation'
    });
  }
};

/**
 * Get all messages in a conversation
 */
const getConversationMessages = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const conversationId = parseInt(req.params.id, 10);

    const messages = await Message.getConversationMessages(conversationId, userId);

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    if (error.message === 'User is not a participant in this conversation') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas participant de cette conversation'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages'
    });
  }
};

/**
 * Create a new conversation or get existing one
 * Body: { participantIds: [number] }
 */
const createConversation = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { participantIds } = req.body;

    // Validation
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'participantIds est requis et doit être un tableau non vide'
      });
    }

    // Ensure current user is included in participants
    const allParticipants = [...new Set([userId, ...participantIds])];

    // Verify all participants exist
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = ANY($1)',
      [allParticipants]
    );

    if (userCheck.rows.length !== allParticipants.length) {
      return res.status(400).json({
        success: false,
        message: 'Un ou plusieurs participants sont invalides'
      });
    }

    const conversationId = await Message.createOrGetConversation(allParticipants);

    // Get the conversation info to return
    const conversation = await Message.getConversationInfo(conversationId, userId);

    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error in createConversation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la conversation'
    });
  }
};

/**
 * Send a message in a conversation
 * Body: { conversationId: number, content: string }
 */
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { conversationId, content } = req.body;

    // Validation
    if (!conversationId || !content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'conversationId et content sont requis'
      });
    }

    const message = await Message.sendMessage(conversationId, userId, content.trim());

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    if (error.message === 'User is not a participant in this conversation') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas participant de cette conversation'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message'
    });
  }
};

/**
 * Mark a conversation as read
 */
const markConversationAsRead = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const conversationId = parseInt(req.params.id, 10);

    await Message.markAsRead(conversationId, userId);

    res.json({
      success: true,
      message: 'Conversation marquée comme lue'
    });
  } catch (error) {
    console.error('Error in markConversationAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage de la conversation'
    });
  }
};

/**
 * Get unread message count for the authenticated user
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const count = await Message.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du nombre de messages non lus'
    });
  }
};

/**
 * Delete a message (soft delete)
 */
const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const messageId = parseInt(req.params.id, 10);

    await Message.deleteMessage(messageId, userId);

    res.json({
      success: true,
      message: 'Message supprimé'
    });
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    if (error.message === 'Message not found or user is not the sender') {
      return res.status(403).json({
        success: false,
        message: 'Message non trouvé ou vous n\'êtes pas l\'expéditeur'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du message'
    });
  }
};

/**
 * Get all users (for creating new conversations)
 * Returns users except the authenticated user
 */
const getAllUsers = async (req, res) => {
  try {
    console.log('getAllUsers called by user:', req.user);
    const userId = req.user.userId || req.user.id;
    console.log('User ID type:', typeof userId, 'Value:', userId);

    console.log('Executing query with userId:', userId, 'Type:', typeof userId);

    const result = await pool.query(
      `SELECT
        id,
        email,
        firstname,
        lastname,
        role,
        profile_picture,
        company,
        phone
      FROM users
      WHERE id != $1
      ORDER BY lastname ASC, firstname ASC`,
      [userId]
    );

    console.log('Found users:', result.rows.length);
    console.log('Sample users:', result.rows.slice(0, 3).map(u => ({ id: u.id, email: u.email })));

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

module.exports = {
  getUserConversations,
  getConversationInfo,
  getConversationMessages,
  createConversation,
  sendMessage,
  markConversationAsRead,
  getUnreadCount,
  deleteMessage,
  getAllUsers
};
