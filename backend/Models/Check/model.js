const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// adding
const checkSchema = new Schema({
    checkId: { type: Number, required: true, unique: true },
    passengerName: { type: String, required: true },
    passportNumber: { type: String, required: true },
    nationality: { type: String },
    flightNumber: { type: String },
    departure: { type: String },
    destination: { type: String },
    seatNumber: { type: String },
    gateNumber: { type: String },
    boardingTime: { type: String },
    baggageCount: { type: Number },
    baggageWeight: { type: Number },
    mealPreference: { type: String },
    status: { type: String }
}, { timestamps: true });

const Check = mongoose.model('Check', checkSchema);
module.exports = Check;
