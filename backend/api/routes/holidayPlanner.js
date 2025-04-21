// backend/api/routes/holidayPlanner.js
const express = require('express');
const axios = require('axios');
const moment = require('moment');
const Trip = require('../../models/Trip');
const router = express.Router();

// Base prices (RM)
const BASE_SERVICE_PRICES = {
  Accommodation: 150,
  Transport:      50,
  Entertainment: 100,
  Meals:          60,
  Insurance:      30,
  Misc:           25,
};

// Region multipliers
const REGION_MULTIPLIER = {
  Asia:       1.0,
  Europe:     1.2,
  Americas:   1.4,
  Africa:     1.3,
  Oceania:    1.5,
  Antarctica: 2.0,
};

// POST /api/holidayPlanner
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      travelDateTime,
      country,
      languageSpoken,
      numberOfTravelers,
      languageSuitability,
      selectedServices = []
    } = req.body;

    if (!customerId || !travelDateTime || !country || !languageSpoken || !numberOfTravelers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // format date/time
    const formattedDate = moment(travelDateTime, 'DD/MM/YYYY hh:mm A').format('DD/MM/YYYY hh:mm A');

    // fetch country info
    const countryResp = await axios.get(`https://restcountries.com/v3.1/name/${country}`);
    const countryData = countryResp.data?.[0];
    if (!countryData) {
      return res.status(400).json({ error: 'Country not found' });
    }

    // language check
    const officialLangs = Object.values(countryData.languages || {});
    const languageMatch = officialLangs.includes(languageSpoken);
    if (languageSuitability && !languageMatch) {
      return res.status(400).json({
        error: `The language ${languageSpoken} is not official for ${country}`
      });
    }

    // price the services
    const region = countryData.region || 'Asia';
    const multiplier = REGION_MULTIPLIER[region] || 1.0;
    const servicesDetailed = selectedServices.map(name => ({
      name,
      priceRM: Math.round((BASE_SERVICE_PRICES[name] || 0) * multiplier * 100) / 100
    }));

    // save trip
    const newTrip = new Trip({
      customerId,
      travelDateTime: formattedDate,
      country: countryData.name.common,
      languageSpoken,
      numberOfTravelers,
      languageSuitability: languageMatch,
      selectedServices: servicesDetailed
    });
    await newTrip.save();

    res.status(201).json({ message: 'Trip planned successfully', trip: newTrip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/holidayPlanner/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Trip.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (err) {
    console.error('Error deleting trip:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
