const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings.cjs');

// Helper to get current status based on time and manual toggle
const getShopStatus = (manualStatus) => {
  if (manualStatus === 'CLOSED') return 'CLOSED';

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // 9:00 AM to 3:00 PM (15:00)
  if (currentHour >= 9 && currentHour < 15) {
    return 'OPEN';
  }
  
  return 'CLOSED';
};

// GET /api/settings/status
router.get('/status', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ manualStatus: 'OPEN' });
    }

    const calculatedStatus = getShopStatus(settings.manualStatus);

    res.json({
      manualStatus: settings.manualStatus,
      calculatedStatus: calculatedStatus,
      isOpen: calculatedStatus === 'OPEN',
      timeWindow: '09:00 - 15:00'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/toggle
router.post('/toggle', async (req, res) => {
  const { status } = req.body;
  if (!['OPEN', 'CLOSED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    settings.manualStatus = status;
    await settings.save();

    const calculatedStatus = getShopStatus(settings.manualStatus);
    res.json({
      manualStatus: settings.manualStatus,
      calculatedStatus: calculatedStatus,
      isOpen: calculatedStatus === 'OPEN'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
