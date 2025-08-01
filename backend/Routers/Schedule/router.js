const express = require('express');
const router = express.Router();
const controller = require('../../Controllers/Schedule/controller');

router.get('/schedules', controller.getSchedules);
router.post('/createschedule', controller.addSchedule);
router.post('/updateschedule', controller.updateSchedule);
router.post('/deleteschedule', controller.deleteSchedule);

module.exports = router;
