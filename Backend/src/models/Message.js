const pool = require('../config/database');

class Message {
  /**
   * Create or get existing conversation between users
   * @param {Array<number>} participantIds - Array of user IDs
   * @returns {Promise<number>} conversationId
   */
  static async createOrGetConversation(participantIds) {
    // Sort participant IDs to ensure consistent lookup
    const sortedIds = [...participantIds].sort((a, b) => a - b);

    try {
      // Check if conversation already exists between these users
      const existingConversation = await pool.query(
        `SELECT DISTINCT cp1.conversation_id
         FROM conversation_participants cp1
         WHERE cp1.conversation_id IN (
           SELECT conversation_id
           FROM conversation_participants
           WHERE user_id = ANY($1)
           GROUP BY conversation_id
           HAVING COUNT(DISTINCT user_id) = $2
         )
         AND (
           SELECT COUNT(DISTINCT user_id)
           FROM conversation_participants
           WHERE conversation_id = cp1.conversation_id
         ) = $2
         LIMIT 1`,
        [sortedIds, sortedIds.length]
      );

      if (existingConversation.rows.length > 0) {
        return existingConversation.rows[0].conversation_id;
      }

      // Create new conversation
      const conversationResult = await pool.query(
        'INSERT INTO conversations (created_at, updated_at, last_message_at) VALUES (NOW(), NOW(), NOW()) RETURNING id'
      );
      const conversationId = conversationResult.rows[0].id;

      // Add all participants
      for (const userId of participantIds) {
        await pool.query(
          'INSERT INTO conversation_participants (conversation_id, user_id, joined_at, last_read_at) VALUES ($1, $2, NOW(), NOW())',
          [conversationId, userId]
        );
      }

      return conversationId;
    } catch (error) {
      console.error('Error in createOrGetConversation:', error);
      throw error;
    }
  }

  /**
   * Get all conversations for a user with last message info
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  static async getUserConversations(userId) {
    try {
      const result = await pool.query(
        `SELECT
          c.id,
          c.created_at,
          c.updated_at,
          c.last_message_at,
          cp.last_read_at,
          -- Get other participants info
          json_agg(
            json_build_object(
              'id', u.id,
              'firstname', u.firstname,
              'lastname', u.lastname,
              'email', u.email,
              'profile_picture', u.profile_picture,
              'role', u.role
            )
          ) FILTER (WHERE u.id != $1) as participants,
          -- Get last message
          (
            SELECT json_build_object(
              'id', m.id,
              'content', m.content,
              'sender_id', m.sender_id,
              'created_at', m.created_at,
              'sender_firstname', sender.firstname,
              'sender_lastname', sender.lastname
            )
            FROM messages m
            JOIN users sender ON sender.id = m.sender_id
            WHERE m.conversation_id = c.id
            AND m.is_deleted = false
            ORDER BY m.created_at DESC
            LIMIT 1
          ) as last_message,
          -- Count unread messages
          (
            SELECT COUNT(*)
            FROM messages m
            WHERE m.conversation_id = c.id
            AND m.created_at > cp.last_read_at
            AND m.sender_id != $1
            AND m.is_deleted = false
          ) as unread_count
        FROM conversations c
        JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.user_id = $1
        JOIN conversation_participants cp_others ON cp_others.conversation_id = c.id
        JOIN users u ON u.id = cp_others.user_id
        GROUP BY c.id, c.created_at, c.updated_at, c.last_message_at, cp.last_read_at
        ORDER BY c.last_message_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error in getUserConversations:', error);
      throw error;
    }
  }

  /**
   * Get all messages in a conversation
   * @param {number} conversationId
   * @param {number} userId - To verify user is participant
   * @returns {Promise<Array>}
   */
  static async getConversationMessages(conversationId, userId) {
    try {
      // First verify user is a participant
      const participantCheck = await pool.query(
        'SELECT id FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
        [conversationId, userId]
      );

      if (participantCheck.rows.length === 0) {
        throw new Error('User is not a participant in this conversation');
      }

      // Get all messages
      const result = await pool.query(
        `SELECT
          m.id,
          m.conversation_id,
          m.sender_id,
          m.content,
          m.created_at,
          m.updated_at,
          m.is_deleted,
          u.firstname as sender_firstname,
          u.lastname as sender_lastname,
          u.email as sender_email,
          u.profile_picture as sender_avatar,
          u.role as sender_role
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.conversation_id = $1 AND m.is_deleted = false
        ORDER BY m.created_at ASC`,
        [conversationId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error in getConversationMessages:', error);
      throw error;
    }
  }

  /**
   * Send a message in a conversation
   * @param {number} conversationId
   * @param {number} senderId
   * @param {string} content
   * @returns {Promise<Object>}
   */
  static async sendMessage(conversationId, senderId, content) {
    try {
      // Verify sender is a participant
      const participantCheck = await pool.query(
        'SELECT id FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
        [conversationId, senderId]
      );

      if (participantCheck.rows.length === 0) {
        throw new Error('User is not a participant in this conversation');
      }

      // Insert message
      const result = await pool.query(
        `INSERT INTO messages (conversation_id, sender_id, content, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING *`,
        [conversationId, senderId, content]
      );

      const message = result.rows[0];

      // Get sender info
      const senderInfo = await pool.query(
        'SELECT firstname, lastname, email, profile_picture, role FROM users WHERE id = $1',
        [senderId]
      );

      return {
        ...message,
        sender_firstname: senderInfo.rows[0].firstname,
        sender_lastname: senderInfo.rows[0].lastname,
        sender_email: senderInfo.rows[0].email,
        sender_avatar: senderInfo.rows[0].profile_picture,
        sender_role: senderInfo.rows[0].role
      };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  /**
   * Mark conversation as read for a user
   * @param {number} conversationId
   * @param {number} userId
   * @returns {Promise<void>}
   */
  static async markAsRead(conversationId, userId) {
    try {
      await pool.query(
        'UPDATE conversation_participants SET last_read_at = NOW() WHERE conversation_id = $1 AND user_id = $2',
        [conversationId, userId]
      );
    } catch (error) {
      console.error('Error in markAsRead:', error);
      throw error;
    }
  }

  /**
   * Get total unread message count for a user
   * @param {number} userId
   * @returns {Promise<number>}
   */
  static async getUnreadCount(userId) {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) as count
         FROM messages m
         JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
         WHERE cp.user_id = $1
         AND m.sender_id != $1
         AND m.created_at > cp.last_read_at
         AND m.is_deleted = false`,
        [userId]
      );

      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      throw error;
    }
  }

  /**
   * Get conversation info with participants
   * @param {number} conversationId
   * @param {number} userId - To verify user is participant
   * @returns {Promise<Object>}
   */
  static async getConversationInfo(conversationId, userId) {
    try {
      // Verify user is a participant
      const participantCheck = await pool.query(
        'SELECT id FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
        [conversationId, userId]
      );

      if (participantCheck.rows.length === 0) {
        throw new Error('User is not a participant in this conversation');
      }

      const result = await pool.query(
        `SELECT
          c.id,
          c.created_at,
          c.updated_at,
          c.last_message_at,
          json_agg(
            json_build_object(
              'id', u.id,
              'firstname', u.firstname,
              'lastname', u.lastname,
              'email', u.email,
              'profile_picture', u.profile_picture,
              'role', u.role
            )
          ) as participants
        FROM conversations c
        JOIN conversation_participants cp ON cp.conversation_id = c.id
        JOIN users u ON u.id = cp.user_id
        WHERE c.id = $1
        GROUP BY c.id, c.created_at, c.updated_at, c.last_message_at`,
        [conversationId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error in getConversationInfo:', error);
      throw error;
    }
  }

  /**
   * Delete a message (soft delete)
   * @param {number} messageId
   * @param {number} userId - User requesting deletion (must be sender)
   * @returns {Promise<void>}
   */
  static async deleteMessage(messageId, userId) {
    try {
      const result = await pool.query(
        'UPDATE messages SET is_deleted = true WHERE id = $1 AND sender_id = $2 RETURNING id',
        [messageId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Message not found or user is not the sender');
      }
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      throw error;
    }
  }
}

module.exports = Message;
