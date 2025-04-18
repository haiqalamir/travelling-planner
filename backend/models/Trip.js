const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  travelDateTime: { type: String, required: true }, // Stored as a formatted date (dd/mm/yyyy)
  country: { type: String, required: true },
  languageSpoken: { type: String, required: true },
  numberOfTravelers: { type: Number, required: true },
  languageSuitability: { type: Boolean, required: true }
  // Extend with additional trip fields if necessary
});

module.exports = mongoose.model('Trip', TripSchema);
