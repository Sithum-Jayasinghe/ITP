const Payment = require('../../Models/Payment/model');

// Get All Payments
const getPayments = (req, res, next) => {
    Payment.find()
        .then(response => res.json({ response }))
        .catch(error => res.json({ error }));
};

// Add New Payment
const addPayment = (req, res, next) => {
    const payment = new Payment({
        id: req.body.id,
        flight: req.body.flight,
        passenger: req.body.passenger,
        seat: req.body.seat,
        price: req.body.price,
        method: req.body.method,
        card: req.body.card,
        expiry: req.body.expiry,
        cvv: req.body.cvv,
        phone: req.body.phone,
        status: req.body.status
    });

    payment.save()
        .then(response => res.json({ response }))
        .catch(error => res.json({ error }));
};

// Update Payment
const updatePayment = (req, res, next) => {
    const {
        id, flight, passenger, seat,
        price, method, card, expiry,
        cvv, phone, status
    } = req.body;

    Payment.updateOne({ id: id }, {
        $set: {
            flight, passenger, seat,
            price, method, card, expiry,
            cvv, phone, status
        }
    })
        .then(response => res.json({ response }))
        .catch(error => res.json({ error }));
};

// Delete Payment
const deletePayment = (req, res, next) => {
    const id = req.body.id;

    Payment.deleteOne({ id: id })
        .then(response => res.json({ response }))
        .catch(error => res.json({ error }));
};

module.exports = {
    getPayments,
    addPayment,
    updatePayment,
    deletePayment
};
