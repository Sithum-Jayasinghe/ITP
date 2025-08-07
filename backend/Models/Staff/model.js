const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const staffSchema = new Schema({
    id: Number,
    name: String,
    role: String,
    num: String,
    email: String,
    certificate: String,
    schedule: String,
    status: String
});

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;
