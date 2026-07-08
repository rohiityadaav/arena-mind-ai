const express = require('express');
const router = express.Router();
const { dbAll, dbRun, generateUuid } = require('../database');

// GET all alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await dbAll(`
      SELECT alerts.*, zones.name as zone_name 
      FROM alerts 
      LEFT JOIN zones ON alerts.zone_id = zones.id 
      ORDER BY alerts.created_at DESC
    `);
    res.json(alerts);
  } catch (error) {
    console.error('Failed to get alerts:', error);
    res.status(500).json({ error: 'Failed to retrieve alerts' });
  }
});

// POST create new alert (staff actions)
router.post('/', async (req, res) => {
  const { stadium_id, zone_id, alert_type, severity, title, description } = req.body;
  if (!stadium_id || !alert_type || !severity || !title) {
    return res.status(400).json({ error: 'Missing required alert fields' });
  }

  if (!['low', 'medium', 'high', 'critical'].includes(severity)) {
    return res.status(400).json({ error: 'Invalid alert severity level' });
  }

  if (!['congestion', 'incident', 'maintenance', 'hazard'].includes(alert_type)) {
    return res.status(400).json({ error: 'Invalid alert type specified' });
  }

  try {
    const id = generateUuid();
    await dbRun(`
      INSERT INTO alerts (id, stadium_id, zone_id, alert_type, severity, title, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'open')
    `, [id, stadium_id, zone_id || null, alert_type, severity, title, description || '']);
    
    // Also, if alert is a congestion alert, we can dynamically increase the zone crowd level
    if (alert_type === 'congestion' && zone_id) {
      await dbRun('UPDATE zones SET crowd_level = 95 WHERE id = ?', [zone_id]);
    }

    res.status(201).json({ id, status: 'open', message: 'Alert created successfully' });
  } catch (error) {
    console.error('Failed to create alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// PUT update alert status (open -> acknowledged -> resolved)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['open', 'acknowledged', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid or missing status' });
  }

  try {
    // If resolving a congestion alert, let's restore the zone's crowd level to normal
    if (status === 'resolved') {
      const alert = await dbAll('SELECT * FROM alerts WHERE id = ?', [id]);
      if (alert.length > 0 && alert[0].alert_type === 'congestion' && alert[0].zone_id) {
        await dbRun('UPDATE zones SET crowd_level = 35 WHERE id = ?', [alert[0].zone_id]);
      }
    }

    await dbRun('UPDATE alerts SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: `Alert status updated to ${status}` });
  } catch (error) {
    console.error('Failed to update alert:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// DELETE an alert
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('DELETE FROM alerts WHERE id = ?', [id]);
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Failed to delete alert:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

module.exports = router;
