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
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
