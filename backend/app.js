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






// Staff

app.get('/api/staffs', (req, res) => {
  controller.getStaffs((staffs) => {
    res.send(staffs); // Send actual staff data as response
  });
});

app.post('/api/createstaff', (req, res) => {
  controller.addStaff(req.body, (callback) => {
    res.send(callback);
  });
});

app.post('/api/updatestaff', (req, res) => {
  controller.updateStaff(req.body, (callback) => {
    res.send(callback);
  });
});

app.post('/api/deletestaff', (req, res) => {
  controller.deleteStaff(req.body, (callback) => {
    res.send(callback);
  });
});





// Register

app.get('/api/registers', (req, res) => {
  controller.getRegisters((registers) => {
    res.send(registers); // Send actual register data as response
  });
});

app.post('/api/createregister', (req, res) => {
  controller.addRegister(req.body, (callback) => {
    res.send(callback);
  });
});

app.post('/api/updateregister', (req, res) => {
  controller.updateRegister(req.body, (callback) => {
    res.send(callback);
  });
});

app.post('/api/deleteregister', (req, res) => {
  controller.deleteRegister(req.body, (callback) => {
    res.send(callback);
  });
});



module.exports = app;