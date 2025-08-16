const Passenger = require('../../Models/Passenger/model');

// Get all passengers
const getPassengers = (req, res, next) => {
    Passenger.find()
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ error });
        });
};

// Add a passenger
const addPassenger = (req, res, next) => {
    const passenger = new Passenger({
        id: req.body.id,
        name: req.body.name,
        details: req.body.details,
        baggage: req.body.baggage,
        baggagePrice: req.body.baggagePrice,
        meal: req.body.meal,
        mealPrice: req.body.mealPrice
    });

    passenger.save()
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ error });
        });
};

// Update a passenger
const updatePassenger = (req, res, next) => {
    const { id, name, details, baggage, baggagePrice, meal, mealPrice } = req.body;

    Passenger.updateOne(
        { id: id },
        {
            $set: {
                name: name,
                details: details,
                baggage: baggage,
                baggagePrice: baggagePrice,
                meal: meal,
                mealPrice: mealPrice
            }
        }
    )
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ error });
        });
};

// Delete a passenger
const deletePassenger = (req, res, next) => {
    const id = req.body.id;

    Passenger.deleteOne({ id: id })
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ error });
        });
};

// Export
exports.getPassengers = getPassengers;
exports.addPassenger = addPassenger;
exports.updatePassenger = updatePassenger;
exports.deletePassenger = deletePassenger;
