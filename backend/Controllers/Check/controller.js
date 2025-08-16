const Check = require('../../Models/Check/model');

// ✅ Get all checks
const getChecks = (req, res, next) => {
    Check.find()
        .then(response => res.json({ response }))
        .catch(error => res.json({ error }));
};

// ✅ Add a check
const addCheck = (req, res, next) => {
    const check = new Check({
        checkId: req.body.checkId,
        passengerName: req.body.passengerName,
        passportNumber: req.body.passportNumber,
        nationality: req.body.nationality,
        flightNumber: req.body.flightNumber,
        departure: req.body.departure,
        destination: req.body.destination,
        seatNumber: req.body.seatNumber,
        gateNumber: req.body.gateNumber,
        boardingTime: req.body.boardingTime,
        baggageCount: req.body.baggageCount,
        baggageWeight: req.body.baggageWeight,
        mealPreference: req.body.mealPreference,
        status: req.body.status
    });

    check.save()
        .then(response => res.json({ response }))
        .catch(error => res.json({ error }));
};

// ✅ Update a check
const updateCheck = (req, res, next) => {
    const {
        checkId,
        passengerName,
        passportNumber,
        nationality,
        flightNumber,
        departure,
        destination,
        seatNumber,
        gateNumber,
        boardingTime,
        baggageCount,
        baggageWeight,
        mealPreference,
        status
    } = req.body;

    Check.updateOne(
        { checkId: checkId },
        {
            $set: {
                passengerName,
                passportNumber,
                nationality,
                flightNumber,
                departure,
                destination,
                seatNumber,
                gateNumber,
                boardingTime,
                baggageCount,
                baggageWeight,
                mealPreference,
                status
            }
        }
    )
        .then(response => res.json({ response }))
        .catch(error => res.json({ error }));
};

// ✅ Delete a check
const deleteCheck = (req, res, next) => {
    const checkId = req.body.checkId;

    Check.deleteOne({ checkId: checkId })
        .then(response => res.json({ response }))
        .catch(error => res.json({ error }));
};

exports.getChecks = getChecks;
exports.addCheck = addCheck;
exports.updateCheck = updateCheck;
exports.deleteCheck = deleteCheck;
