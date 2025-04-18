const express = require('express');
const Trip = require('../../models/Trip');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/viewPlans
// Returns all trips for the authenticated customer
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Assume auth middleware attaches a user object to the request
    const customerId = req.user.id;
    const trips = await Trip.find({ customerId });
    res.json(trips);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// GET /api/viewPlans/:id
// Returns a specific trip if it belongs to the authenticated customer
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const tripId = req.params.id;
    const customerId = req.user.id;
    
    const trip = await Trip.findOne({ _id: tripId, customerId });
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or access denied' });
    }
    
    res.json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
