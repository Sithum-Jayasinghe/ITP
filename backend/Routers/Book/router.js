const express = require('express');
const router = express.Router();
const controller = require('../../Controllers/Book/controller');

router.get('/bookings', controller.getBookings);
router.post('/createbooking', controller.addBooking);
router.post('/updatebooking', controller.updateBooking);
router.post('/deletebooking', controller.deleteBooking);

module.exports = router;
