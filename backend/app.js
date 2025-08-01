const express = require('express');
const app = express();
const cors = require('cors');
const controller = require('./Controllers/User/controller');
const controller = require('./Controllers/Payment/controller');
const controller = require('../../Controllers/Schedule/controller');


app.use(cors());

app.use(
    express.urlencoded({
        extended:true,
    })
);

app.use(express.json());



// Use controller methods directly as handlers:
app.get('/api/users', (req, res) => {
  controller.getUsers((users) => {
    res.send(users); // ✅ Send actual user data as response
  });
});



app.post('/api/createuser', (req,res) => {
    controller.addUser(req.body,(callack) => {
        res.send();
    });
});


app.post('/api/updateuser', (req,res) => {
    controller.updateUser(req.body,(callack) => {
        res.send(callack);
    });
});


app.post('/api/deleteuser', (req,res) => {
    controller.deleteUser(req.body,(callack) => {
        res.send(callack);
    });
});









//payment
// Use controller methods directly as handlers:
app.get('/api/payments', (req, res) => {
  controller.getPayments((payments) => {
    res.send(payments); // ✅ Send actual user data as response
  });
});



app.post('/api/createpayment', (req,res) => {
    controller.addPayment(req.body,(callack) => {
        res.send();
    });
});


app.post('/api/updatepayment', (req,res) => {
    controller.updatePayment(req.body,(callack) => {
        res.send(callack);
    });
});


app.post('/api/deletepayment', (req,res) => {
    controller.deletePayment(req.body,(callack) => {
        res.send(callack);
    });
});





//Schedule

app.get('/api/schedules', (req, res) => {
  controller.getSchedules((schedules) => {
    res.send(schedules); // Send actual schedule data as response
  });
});



app.post('/api/createschedule', (req, res) => {
  controller.addSchedule(req.body, (callback) => {
    res.send(callback);
  });
});



app.post('/api/updateschedule', (req, res) => {
  controller.updateSchedule(req.body, (callback) => {
    res.send(callback);
  });
});



app.post('/api/deleteschedule', (req, res) => {
  controller.deleteSchedule(req.body, (callback) => {
    res.send(callback);
  });
});



module.exports = app;