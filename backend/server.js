const express = require('express');
const app = express();
const cors = require('cors');
const port = 3001;
const host = 'localhost';
const mongoose = require('mongoose');
const userrouter = require('./Routers/User/router') ;
const paymentrouter = require('./Routers/Payment/router') ;
const registerrouter = require('./Routers/Reg/router') ;
const shedulerouter = require('./Routers/Schedule/router');


//password = 8e81ltTBjQy5U2P6

app.use(cors());
app.use(express.json());

//mongodb+srv://sithum:<db_password>@sithum.nufzmzp.mongodb.net/?retryWrites=true&w=majority&appName=sithum

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
app.use('/api', registerrouter);
app.use('/api', shedulerouter);
