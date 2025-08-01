const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({

    
    id: { type: Number, required: true },
    flightName: { type: String, required: true },
    departure: { type: String, required: true },
    arrival: { type: String, required: true },
    dtime: { type: String, required: true },   // Departure DateTime
    atime: { type: String, required: true },   // Arrival DateTime
    aircraft: { type: String, required: true },
    seats: { type: Number, required: true },
    status: { type: String, required: true }

});

const Schedule = mongoose.model('Schedule', userSchema);
module.exports = Schedule;
