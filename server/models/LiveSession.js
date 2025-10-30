const mongoose = require('mongoose');

const LiveSessionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  unique_id: { type: String, required: true, unique: true },
  userurl: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('LiveSession', LiveSessionSchema);