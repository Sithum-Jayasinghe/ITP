const express = require('express');
const router = express.Router();
const controller = require('../../Controllers/Payment/controller');


router.get('/payments', controller.getPayments);
router.post('/createpayment', controller.addPayment);
router.post('/updatepayment', controller.updatePayment);
router.post('/deletepayment', controller.deletePayment);

module.exports = router;