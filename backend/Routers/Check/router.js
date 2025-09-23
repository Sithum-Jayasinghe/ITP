const express = require('express');
const router = express.Router();
const controller = require('../../Controllers/Check/controller');

//  Routes
router.get('/checks', controller.getChecks);
router.post('/createcheck', controller.addCheck);
router.post('/updatecheck', controller.updateCheck);
router.post('/deletecheck', controller.deleteCheck);

module.exports = router;
