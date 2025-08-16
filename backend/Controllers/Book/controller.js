const Booking = require('../../Models/Book/model'); // Adjust path as needed

// Get all bookings
const getBookings = (req, res, next) => {
  Booking.find()
    .then(response => res.json({ response }))
    .catch(error => res.json({ error }));
};

// Add booking
const addBooking = (req, res, next) => {
  const booking = new Booking({
    id: req.body.id,
    from: req.body.from,
    to: req.body.to,
    departure: req.body.departure,
    returnDate: req.body.returnDate,
    passengers: req.body.passengers,
    travelClass: req.body.travelClass,
    tripType: req.body.tripType,
    flexibleDates: req.body.flexibleDates
  });

  booking.save()
    .then(response => res.json({ response }))
    .catch(error => res.json({ error }));
};

// Update booking
const updateBooking = (req, res, next) => {
  const { id, from, to, departure, returnDate, passengers, travelClass, tripType, flexibleDates } = req.body;

  Booking.updateOne(
    { id: id },
    {
      $set: {
        from,
        to,
        departure,
        returnDate,
        passengers,
        travelClass,
        tripType,
        flexibleDates
      }
    }
  )
  .then(response => res.json({ response }))
  .catch(error => res.json({ error }));
};

// Delete booking
const deleteBooking = (req, res, next) => {
  const id = req.body.id;

  Booking.deleteOne({ id: id })
    .then(response => res.json({ response }))
    .catch(error => res.json({ error }));
};

module.exports = {
  getBookings,
  addBooking,
  updateBooking,
  deleteBooking
};
