const express = require('express');
const router = express.Router();
const controller = require('../../Controllers/Staff/controller');

router.get('/staffs', controller.getStaffs);
router.post('/createstaff', controller.addStaff);
router.post('/updatestaff', controller.updateStaff);
router.post('/deletestaff', controller.deleteStaff);

module.exports = router;
