const express = require('express');
const router = express.Router();
const controller = require('../../Controllers/Passenger/controller');

router.get('/passengers', controller.getPassengers);
router.post('/createpassenger', controller.addPassenger);
router.post('/updatepassenger', controller.updatePassenger);
router.post('/deletepassenger', controller.deletePassenger);

module.exports = router;
