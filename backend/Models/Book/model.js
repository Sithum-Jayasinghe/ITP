const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  id: {
    type: Number,
    required: true,
    min: 1, // must be positive
  },
  from: {
    type: String,
    required: true,
    trim: true,
  },
  to: {
    type: String,
    required: true,
    trim: true,
  },
  departure: {
    type: String, // ISO date string
    required: true,
  },
  returnDate: {
    type: String, // ISO date string
  },
  passengers: {
    type: Number,
    required: true,
    min: 1, // at least one passenger
  },
  travelClass: {
    type: String,
    enum: ["Economy", "Business", "First"], // allowed values
    required: true,
  },
  tripType: {
    type: String,
    enum: ["round", "oneway"], // only these 2 options
    required: true,
  },
  flexibleDates: {
    type: Boolean,
    default: false,
  },
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
