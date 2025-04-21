// backend/models/Trip.js
const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: String,
  priceRM: Number,
}, { _id: false });

const TripSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  travelDateTime: { type: String, required: true },
  country: { type: String, required: true },
  languageSpoken: { type: String, required: true },
  numberOfTravelers: { type: Number, required: true },
  languageSuitability: { type: Boolean, required: true },
  selectedServices: [ServiceSchema],    // <-- new field
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
