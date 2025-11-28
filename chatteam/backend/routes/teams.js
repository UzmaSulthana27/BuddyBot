const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all teams for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [teams] = await db.query(`
      SELECT t.*, tm.role 
      FROM teams t
      INNER JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = ?
      ORDER BY t.created_at DESC
    `, [userId]);

    res.json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new team
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    // Create team
    const [result] = await db.query(
      'INSERT INTO teams (name, created_by) VALUES (?, ?)',
      [name.trim(), userId]
    );

    const teamId = result.insertId;

    // Add creator as owner
    await db.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
      [teamId, userId, 'owner']
    );

    // Create default general channel
    await db.query(
      'INSERT INTO channels (name, team_id) VALUES (?, ?)',
      ['general', teamId]
    );

    res.status(201).json({
      message: 'Team created successfully',
      team: { id: teamId, name, role: 'owner' }
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get team channels
router.get('/:teamId/channels', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    // Verify user is member of team
    const [members] = await db.query(
      'SELECT id FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, userId]
    );

    if (members.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get channels
    const [channels] = await db.query(
      'SELECT * FROM channels WHERE team_id = ? ORDER BY name',
      [teamId]
    );

    res.json({ channels });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create channel
router.post('/:teamId/channels', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, isAiEnabled } = req.body;
    const userId = req.user.id;

    // Verify user is member
    const [members] = await db.query(
      'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, userId]
    );

    if (members.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    // Create channel
    const channelName = name.toLowerCase().replace(/\s+/g, '-');
    const [result] = await db.query(
      'INSERT INTO channels (name, team_id, is_ai_enabled) VALUES (?, ?, ?)',
      [channelName, teamId, isAiEnabled || false]
    );

    res.status(201).json({
      message: 'Channel created successfully',
      channel: {
        id: result.insertId,
        name: channelName,
        team_id: teamId,
        is_ai_enabled: isAiEnabled || false
      }
    });
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;