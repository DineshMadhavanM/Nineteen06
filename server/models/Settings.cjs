const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  manualStatus: {
    type: String,
    enum: ['OPEN', 'CLOSED'],
    default: 'OPEN'
  },
  shopName: {
    type: String,
    default: 'Nineteen06'
  },
  outOfStockItems: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
