// backend/api/routes/invoices.js
const express = require('express');
const Invoice = require('../../models/Invoice');
const Trip    = require('../../models/Trip');
const auth    = require('../middleware/auth');  // your JWT/session guard
const router  = express.Router();

// GET /api/invoices
// — returns a list of this user’s invoices
router.get('/', auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ customerId: req.user.id }).sort('-date');
    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/invoices
// — create a new invoice for a given tripId
router.post('/', auth, async (req, res) => {
  try {
    const { tripId } = req.body;

    // fetch the trip, ensure it belongs to this user
    const trip = await Trip.findById(tripId);
    if (!trip || trip.customerId.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // build line‑items out of the trip’s services array
    // (you’ll need to have added a `services` field on Trip that looks like
    //  [{ name, price }, …] when the user checked those boxes)
    const items = trip.services.map(s => ({
      description: s.name,
      amount:      s.price
    }));
    const total = items.reduce((sum, i) => sum + i.amount, 0);

    // figure out next invoiceNumber
    const last = await Invoice.findOne().sort('-invoiceNumber');
    const nextNum = last ? last.invoiceNumber + 1 : 1;

    const inv = new Invoice({
      invoiceNumber: nextNum,
      customerId:    req.user.id,
      tripId,
      items,
      total
    });

    await inv.save();
    res.status(201).json(inv);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
