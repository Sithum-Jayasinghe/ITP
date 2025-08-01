const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    id: { type: Number, required: true },
    flight: { type: String, required: true },
    passenger: { type: String, required: true },
    seat: { type: String, required: true },
    price: { type: Number, required: true },
    method: { type: String, required: true },
    card: { type: String, required: true },
    expiry: { type: String, required: true },
    cvv: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, required: true }

});

const Payment = mongoose.model('Payment', userSchema);
module.exports = Payment;