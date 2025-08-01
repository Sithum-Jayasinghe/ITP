const Schedule = require('../../Models/Schedule/model');


// Get all schedules
const getSchedules = (req, res, next) => {
    Schedule.find()
        .then(response => res.json({ response }))
        .catch(error => res.json({ error }));
};


// Add schedule
const addSchedule = (req, res, next) => {
    const schedule = new Schedule({
        id: req.body.id,
        flightName: req.body.flightName,
        departure: req.body.departure,
        arrival: req.body.arrival,
        dtime: req.body.dtime,
        atime: req.body.atime,
        aircraft: req.body.aircraft,
        seats: req.body.seats,
        status: req.body.status,
    });
    schedule.save()
        .then(response => res.json({ response }))
        .catch(error => res.json({ error }));
};



// Update schedule
const updateSchedule = (req, res, next) => {
    const { id, flightName, departure, arrival, dtime, atime, aircraft, seats, status } = req.body;

    Schedule.updateOne(
        { id: id },
        { $set: { flightName, departure, arrival, dtime, atime, aircraft, seats, status } }
    )
        .then(response => res.json({ response }))
        .catch(error => res.json({ error }));
};



// Delete schedule
const deleteSchedule = (req, res, next) => {
    const id = req.body.id;

    Schedule.deleteOne({ id: id })
        .then(response => res.json({ response }))
        .catch(error => res.json({ error }));
};



exports.getSchedules = getSchedules;
exports.addSchedule = addSchedule;
exports.updateSchedule = updateSchedule;
exports.deleteSchedule = deleteSchedule;
