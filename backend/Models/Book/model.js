const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  id: Number,
  from: String,
  to: String,
  departure: String,      // ISO date string
  returnDate: String,     // ISO date string
  passengers: Number,
  travelClass: String,
  tripType: String,       // "round" or "oneway"
  flexibleDates: Boolean
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
