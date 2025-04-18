// backend/api/routes/holidayPlanner.js
const express = require('express');
const axios = require('axios');
const moment = require('moment');
const Trip = require('../../models/Trip');
const router = express.Router();

// Existing POST route for planning a trip
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      travelDateTime,
      country,
      languageSpoken,
      numberOfTravelers,
      languageSuitability
    } = req.body;
    
    if (!customerId || !travelDateTime || !country || !languageSpoken || !numberOfTravelers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Format date and time (assumes travelDateTime is received as a string in "DD/MM/YYYY HH:mm")
    const formattedDate = moment(travelDateTime, "DD/MM/YYYY HH:mm").format("DD/MM/YYYY HH:mm");
    
    // Call external REST Countries API (example call – adjust as needed)
    const countryResponse = await axios.get(`https://restcountries.com/v3.1/name/${country}`);
    if (!countryResponse.data || countryResponse.data.length === 0) {
      return res.status(400).json({ error: 'Country not found' });
    }
    const countryData = countryResponse.data[0];
    const officialLanguages = Object.values(countryData.languages || {});
    const languageMatch = officialLanguages.includes(languageSpoken);
    
    if (languageSuitability && !languageMatch) {
      return res.status(400).json({ error: `The language ${languageSpoken} is not official for ${country}` });
    }
    
    const newTrip = new Trip({
      customerId,
      travelDateTime: formattedDate,
      country: countryData.name.common,
      languageSpoken,
      numberOfTravelers,
      languageSuitability: languageMatch
    });
    
    await newTrip.save();
    res.status(201).json({ message: 'Trip planned successfully', trip: newTrip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- NEW: DELETE route to remove a trip by ID ---
router.delete('/:id', async (req, res) => {
  try {
    const deletedTrip = await Trip.findByIdAndDelete(req.params.id);
    if (!deletedTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
