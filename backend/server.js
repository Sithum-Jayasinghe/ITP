const express = require('express');
const app = express();
const cors = require('cors');
const port = 3001;
const host = 'localhost';
const mongoose = require('mongoose');
const userrouter = require('./Routers/User/router') ;
const paymentrouter = require('./Routers/Payment/router') ;
const shedulerouter = require('./Routers/Schedule/router');
const staffrouter = require('./Routers/Staff/router');
const registerrouter = require('./Routers/Register/router');
const bookingrouter = require('./Routers/Book/router');
const passengerrouter = require('./Routers/Passenger/router');
const checkrouter = require('./Routers/Check/router');


//password = 8e81ltTBjQy5U2P6

app.use(cors());
app.use(express.json());

//mongodb+srv://ayeshsenadheera7:<db_password>@cluster0.f0azxqz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

const uri = 'mongodb+srv://sithum:8e81ltTBjQy5U2P6@sithum.nufzmzp.mongodb.net/?retryWrites=true&w=majority&appName=sithum'
const connect = async () => {
    try{
        await mongoose.connect(uri);
        console.log(`connected to mongodb`)

    }catch(error) {
        console.log(`mongodb error` , error);
    }
};

connect();

const server = app.listen(port, host, () => {
   console.log(`node server is listening to  ${server.address().port}`)


});

app.use('/api', userrouter);
app.use('/api', paymentrouter);
app.use('/api', shedulerouter);
app.use('/api', staffrouter);
app.use('/api', registerrouter);
app.use('/api', bookingrouter );
app.use('/api', passengerrouter);
app.use('/api', checkrouter);