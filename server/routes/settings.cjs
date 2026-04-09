const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings.cjs');

// Helper to get current status based on time and manual toggle
const getShopStatus = (manualStatus) => {
  const now = new Date();
  const currentHour = now.getHours();

  const isDeliveryOpen = currentHour >= 9 && currentHour < 15;
  const isPickupOpen = currentHour >= 17 && currentHour < 21;
  const isOpen = (isDeliveryOpen || isPickupOpen) && manualStatus !== 'CLOSED';
  
  return {
    status: manualStatus === 'CLOSED' ? 'CLOSED' : (isOpen ? 'OPEN' : 'CLOSED'),
    isDeliveryOpen: manualStatus === 'CLOSED' ? false : isDeliveryOpen,
    isPickupOpen: manualStatus === 'CLOSED' ? false : isPickupOpen
  };
};

// GET /api/settings/status
router.get('/status', async (req, res) => {
  console.log('Received status request');
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ manualStatus: 'OPEN' });
    }

    const shopStatusData = getShopStatus(settings.manualStatus);

    res.json({
      manualStatus: settings.manualStatus,
      calculatedStatus: shopStatusData.status,
      isOpen: shopStatusData.status === 'OPEN',
      isDeliveryOpen: shopStatusData.isDeliveryOpen,
      isPickupOpen: shopStatusData.isPickupOpen,
      timeWindow: 'Delivery: 09:00 - 15:00 | Pickup: 17:00 - 21:00'
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

    const shopStatusData = getShopStatus(settings.manualStatus);
    res.json({
      manualStatus: settings.manualStatus,
      calculatedStatus: shopStatusData.status,
      isOpen: shopStatusData.status === 'OPEN',
      isDeliveryOpen: shopStatusData.isDeliveryOpen,
      isPickupOpen: shopStatusData.isPickupOpen
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
