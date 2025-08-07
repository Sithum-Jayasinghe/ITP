const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const registerSchema = new Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String },
    password: { type: String },
    phone: { type: String },
    profilePhoto: { type: String } // base64 string or URL
});

const Register = mongoose.model('Register', registerSchema);

module.exports = Register;
