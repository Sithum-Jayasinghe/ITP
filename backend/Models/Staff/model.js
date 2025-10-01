const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const staffSchema = new Schema({
    id: Number,
    name: String,
    role: String,
    num: String,
    email: String,
    shiftStartDate:String,
    shiftEndDate:String,
    shiftStartTime:String,
    shiftEndTime:String,
    certificate: String,
    schedule: String,
    status: String
});

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;
