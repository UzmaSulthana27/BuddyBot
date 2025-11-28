const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get channel messages
router.get('/channel/:channelId', authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const [messages] = await db.query(`
      SELECT 
        m.*,
        u.username,
        u.email
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.channel_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `, [channelId, parseInt(limit), parseInt(offset)]);

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



// Save message (used by socket events)
async function saveMessage(channelId, userId, content, isAi = false, isFile = false, fileUrl = null) {
  try {
    const [result] = await db.query(
      'INSERT INTO messages (channel_id, user_id, content, is_ai, is_file, file_url) VALUES (?, ?, ?, ?, ?, ?)',
      [channelId, userId, content, isAi, isFile, fileUrl]
    );

    const [messages] = await db.query(`
      SELECT 
        m.*,
        u.username,
        u.email
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `, [result.insertId]);

    return messages[0];
  } catch (error) {
    console.error('Save message error:', error);
    throw error;
  }
}

module.exports = router;
module.exports.saveMessage = saveMessage;