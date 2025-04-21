// backend/models/Invoice.js
const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: Number, required: true, unique: true },
  date:          { type: Date,   default: Date.now },
  customerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tripId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  items: [
    {
      description: { type: String, required: true },
      amount:      { type: Number, required: true }
    }
  ],
  total: { type: Number, required: true }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
