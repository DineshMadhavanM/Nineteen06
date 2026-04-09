const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings.cjs');

// Helper to get current status based on time and manual toggle
const getShopStatus = (manualStatus) => {
  // Get time in IST
  const nowIST = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  const currentHour = nowIST.getHours();

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
      timeWindow: 'Delivery: 09:00 - 15:00 | Pickup: 17:00 - 21:00',
      outOfStockItems: settings.outOfStockItems || []
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
      isPickupOpen: shopStatusData.isPickupOpen,
      outOfStockItems: settings.outOfStockItems || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/stock/:itemId
router.post('/stock/:itemId', async (req, res) => {
  const { itemId } = req.params;
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    const stockItems = settings.outOfStockItems || [];
    const index = stockItems.indexOf(itemId);
    
    if (index === -1) {
      stockItems.push(itemId); // Mark out of stock
    } else {
      stockItems.splice(index, 1); // Mark in stock
    }

    settings.outOfStockItems = stockItems;
    await settings.save();

    res.json({ outOfStockItems: settings.outOfStockItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
