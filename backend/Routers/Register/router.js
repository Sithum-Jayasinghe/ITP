const express = require('express');
const router = express.Router();
const controller = require('../../Controllers/Register/controller');

router.get('/registers', controller.getRegisters);
router.post('/createregister', controller.addRegister);
router.post('/updateregister', controller.updateRegister);
router.post('/deleteregister', controller.deleteRegister);

module.exports = router;
