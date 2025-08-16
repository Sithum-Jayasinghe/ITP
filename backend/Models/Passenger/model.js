const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passengerSchema = new Schema({
    id: Number,
    name: String,
    details: String,
    baggage: String,
    baggagePrice: Number,
    meal: String,
    mealPrice: Number
});

const Passenger = mongoose.model('Passenger', passengerSchema);
module.exports = Passenger;
